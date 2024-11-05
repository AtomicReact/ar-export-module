import { parse, relative, resolve } from "node:path"
import { existsSync, readdirSync, mkdirSync, statSync, rmSync } from "node:fs"

import { Atomic, IAtomicConfig, IFileDescription, log, normalizeModuleName } from "atomicreact-ts"

interface IOneDirOneModule extends Omit<IAtomicConfig, "indexScriptFilePath"> {
    atomic: Atomic,
    indexScriptFileName: string,
    srcPath: string,
    outPath: string,
    ignoreAlreadyBundled?: boolean
}

export class OneDirOneModule {

    srcDirPath: string
    outDirPath: string

    constructor(public config: IOneDirOneModule) {

        this.srcDirPath = resolve(this.config.srcPath)

        if (!existsSync(this.srcDirPath)) return
        if (!statSync(this.srcDirPath).isDirectory()) return

        this.outDirPath = resolve(this.config.outPath)

        rmSync(this.outDirPath, { recursive: true, force: true })
        if (!existsSync(this.outDirPath)) mkdirSync(this.outDirPath, { recursive: true })

        this.config.ignoreAlreadyBundled ??= true

        this.config.atomic.afterBundle(async (fileDescription) => {
            await this.bundleDir(this.srcDirPath, fileDescription)
        })
    }

    async bundleDir(dirPath = this.srcDirPath, fileDescriptionToIgnore: IFileDescription[] = []) {

        for (const fileOrDir of readdirSync(dirPath)) {
            const path = resolve(dirPath, fileOrDir)

            if (!statSync(path).isDirectory()) continue

            const relativePath = relative(this.srcDirPath, path)

            const outScriptDir = resolve(this.outDirPath, relativePath)

            mkdirSync(outScriptDir, { recursive: true })
            const outScriptFilePath = resolve(outScriptDir, `${normalizeModuleName(this.config.indexScriptFileName)}.js`)
            const outStyleFilePath = resolve(outScriptDir, `${normalizeModuleName(this.config.indexScriptFileName)}.css`)

            if (this.config.atomic.config.verbose) log(`─── [${OneDirOneModule.name}]`, outScriptFilePath)

            const config: IAtomicConfig = {
                ...this.config.atomic.config,
                ...this.config,
                indexScriptFilePath: resolve(path, this.config.indexScriptFileName),
                includeCore: false,
                outScriptFilePath,
                outStyleFilePath,
                autoLoad: false,
            }
            const atomic = new Atomic(config)
            atomic.indexScriptDirPath = this.config.atomic.indexScriptDirPath

            if (this.config.ignoreAlreadyBundled) {
                atomic.beforeBundle(async (filesDescription) => {
                    for (const fileDescToIgnore of fileDescriptionToIgnore) {
                        filesDescription = filesDescription.filter(fd => fd.hashFilePath !== fileDescToIgnore.hashFilePath)
                    }
                    return filesDescription
                })
            }

            await atomic.bundle()

        }

    }


}