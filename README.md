# AtomicReact-TS Export Modules

Export tool for export modules for AtomicReact-TS

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
│   └── pages
│   │   └── error
│   │   └── not_found
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

<details>

Command for printing directory tree

``` bash
ls -aR | grep ":$" | perl -pe 's/:$//;s/[^-][^\/]*\//    /g;s/^    (\S)/└── \1/;s/(^    |    (?= ))/│   /g;s/    (\S)/└── \1/'
```

</detail>