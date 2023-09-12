# `@julr/typescript-configs`

In TypeScript, the configuration file can extend from a base file. This package provided a few common base configuration files to simplify TypeScript project setup.

## Installation

```sh
pnpm add -D @julr/typescript-configs
```

## Usage

### All projects

The base configuration file is `tsconfig.base.json`. It contains the common configuration for all projects. Enable all strictness options.

```json
{
  "extends": "@julr/typescript-configs/tsconfig.base.json",
  "compilerOptions": {
    //
  }
}
```

### Node project

```json
{
  "extends": "@julr/typescript-configs/node-18-cjs.json",
  // Can also be `node-18-esm.json` for ESM project
  // "extends": "@julr/typescript-configs/node-18-esm.json",
  "compilerOptions": {
    "baseUrl": ".",
    "rootDir": "."
  }
}
```
