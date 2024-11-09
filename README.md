# AtomicReact-TS Export Modules &middot; [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/AtomicReact/ar-export-module/blob/master/LICENSE) [![npm version](https://img.shields.io/npm/v/ar-export-module.svg?style=flat)](https://www.npmjs.com/package/ar-export-module) ![NPM Downloads](https://img.shields.io/npm/dt/ar-export-module.svg)

Export tool for export separated modules from main module for AtomicReact-TS.

## Installing

- NPM 

```
npm install ar-export-module
```

- YARN 

```
yarn add ar-export-module
```



## One File One Module

Export each file from a directory (srcPath) as a module

Example:
``` typescript
new OneFileOneModule({
    atomic, 
    srcPath: "src/frontend/i18n/locales",
    outPath: "public/locales"
})
```

Input:

``` 
./src/frontend
└── app
│   └── app.tsx
└── i18n
    └── locales
        └── index.ts
        └── en
            └── index.ts
        └── pt-BR
            └── index.ts
```

Output:

```
./public
└── lib
│   └── atomicreact.css
│   └── atomicreact.js
└── locales
    └── index.js
    └── en
    |   └── index.js
    └── pt-BR
        └── index.js
```


## One Dir One Module

Export each directory from a directory (srcPath) as a module
 
Example:

```typescript
new OneDirOneModule({
    atomic,
    srcPath: "src/frontend/tenant",
    outPath: "public/lib/tenant"
})
```

Input:

```
./src/frontend/tenant
└── index.ts
└── tenant_x
│   └── index.tsx
└── tenant_y
    └── index.tsx
```

Output:

```
./public
└── lib
    └── atomicreact.css
    └── atomicreact.js
    └── tenant
        └── tenant_x
        |   └── index.css
        |   └── index.js
        └── tenant_y
            └── index.css
            └── index.js
```

## Loading module (client browser)


```typescript
//bridge.ts - file used between main module and other exported modules
import { Atom } from "atomicreact-ts"

export let APP: typeof Atom

export function setAPP(_APP: typeof Atom) {
    APP = _APP
}

export function getAPP() {
    return APP
}
```

```typescript
//tenant/tenant_x.ts
import { Atom } from "atomicreact-ts"
import { setAPP } from "tenant/bridge.js"

export class TenantX extends Atom {
    struct: () => string = () => (
        <div>
            Hi, im Tenant X
        </div>
    )
}

setAPP(TenantX)
```


```typescript
//main.tsx
import { Atom } from "atomicreact-ts"
import { getAPP } from "./bridge.js"

export class TenantClass {

    public APP: typeof Atom

    constructor() { }

    async init(public name: string): Promise<typeof Atom> {

        return new Promise(async (resolve, reject) => {
            Promise.all([this.loadStyle(), this.loadScript()])
                .then(async (r) => {
                    setTimeout(() => {
                        resolve(this.APP)
                    }, 500)
                })
                .catch(e => {
                    reject(e)
                })
        })
    }

    async loadScript(): Promise<void> {
        const scriptElement = document.createElement("script")
        scriptElement.setAttribute("src", `/public/lib/tenant/${this.name}/app.js`)
        document.head.appendChild(scriptElement)

        return new Promise((resolve, reject) => {

            scriptElement.onload = () => {
                this.APP = getAPP()
                if (!this.APP) reject(new Error("Tenant doesn't set APP"))
                resolve()
            }

            scriptElement.onerror = (e) => {
                reject(`Tenant ${this.id} don't exists`)
            }
        })
    }

    async loadStyle(): Promise<void> {
        const styleElement = document.createElement("link")
        styleElement.setAttribute("rel", "stylesheet")
        styleElement.setAttribute("href", `/public/lib/tenant/${this.name}/app.css`)
        document.documentElement.style.visibility = "hidden"
        document.head.appendChild(styleElement)

        return new Promise((resolve, reject) => {

            styleElement.onload = () => {
                document.documentElement.style.visibility = "visible"
                resolve()
            }
            styleElement.onerror = (e) => {
                reject(`Tenant ${this.name} don't exists`)
            }
        })
    }

}

export const Tenant = new TenantClass()
```


<details>
Command for printing directory tree

``` bash
ls -aR | grep ":$" | perl -pe 's/:$//;s/[^-][^\/]*\//    /g;s/^    (\S)/└── \1/;s/(^    |    (?= ))/│   /g;s/    (\S)/└── \1/'
```
</detail>