import { parse, relative, resolve } from "node:path"
import { existsSync, readdirSync, mkdirSync, statSync, readFileSync, rmSync } from "node:fs"

import { Atomic, FileType, IAtomicConfig, identifyFileType, log } from "atomicreact-ts"

interface IOneFileOneModule extends Omit<IAtomicConfig, "indexScriptFilePath"> {
    atomic: Atomic,
    srcPath: string,
    outPath: string
}

export class OneFileOneModule {

    srcDirPath: string
    outDirPath: string

    constructor(public config: IOneFileOneModule) {


        this.srcDirPath = resolve(this.config.srcPath)

        if (!existsSync(this.srcDirPath)) return

        this.outDirPath = resolve(this.config.outPath)

        rmSync(this.outDirPath, { recursive: true, force: true })
        if (!existsSync(this.outDirPath)) mkdirSync(this.outDirPath, { recursive: true })

        this.config.atomic.beforeBundle(async () => {
            await this.bundleDir(this.srcDirPath)
        })
    }

    async bundleDir(dirPath = this.srcDirPath) {

        for (const fileOrDir of readdirSync(dirPath)) {
            const path = resolve(dirPath, fileOrDir)
            const stat = statSync(path)

            if (stat.isDirectory()) {
                await this.bundleDir(path)
                continue
            }

            const relativePath = relative(this.srcDirPath, path)

            const outScriptFile = parse(resolve(this.outDirPath, relativePath))

            mkdirSync(outScriptFile.dir, { recursive: true })
            const outScriptFilePath = resolve(outScriptFile.dir, `${outScriptFile.name}.js`)
            const outStyleFilePath = resolve(outScriptFile.dir, `${outScriptFile.name}.css`)

            const fileType = identifyFileType(path)
            if (![FileType.ScriptJS, FileType.ScriptTS, FileType.ScriptJSX, FileType.ScriptTSX, FileType.ScriptMJS].includes(fileType)) continue

            if (this.config.atomic.config.verbose) log(`─── [${OneFileOneModule.name}]`, outScriptFilePath)

            const config: IAtomicConfig = {
                ...this.config.atomic.config,
                ...this.config,
                indexScriptFilePath: path,
                includeCore: false,
                outScriptFilePath,
                outStyleFilePath,
                autoLoad: false
            }
            const atomic = new Atomic(config)
            atomic.indexScriptDirPath = this.config.atomic.indexScriptDirPath
            await atomic.bundle()

            if (readFileSync(atomic.config.outStyleFilePath!, { encoding: "utf-8" }).length === 0) {
                rmSync(atomic.config.outStyleFilePath!)
            }

        }

    }


}