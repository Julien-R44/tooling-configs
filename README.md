<p align="center">
  <img src="https://user-images.githubusercontent.com/8337858/194765812-05e19fc8-3820-45c5-8d02-fd838d303200.png">
</p>

## Features

- Designed to work with Prettier, Vue, Typescript, JSX, Node, AdonisJS out of the box
- Lint json files ( TSConfig, package.json )
- Super easy to use ( one line of code )
- [ESLint flat config](https://eslint.org/docs/latest/use/configure/configuration-files-new)
- Use .gitignore as ignore file

## Usage

> [!IMPORTANT]
> - This config is using the new [ESLint Flat config](https://eslint.org/docs/latest/use/configure/configuration-files-new)
> - New/updated rules will not be considered as breaking changes. Only API changes will be considered as breaking changes.

### Install

```bash
pnpm add -D eslint prettier @julr/tooling-configs
```

### Eslint

```ts
// .eslintrc
import { julr } from '@julr/tooling-configs/eslint'

export default await julr({
  // Your config here
})
```

> You don't need `.eslintignore` as it has been provided by the preset.

### Add script for package.json

For example:

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  }
}
```

### Prettier

```json
{
  "prettier": "@julr/prettier-config/prettier"
}
```

### Tsconfig

Node ( ESM ) : 

```json
{
  "extends": "@julr/tooling-configs/tsconfigs/tsconfig.node",
  "compilerOptions": {
    "rootDir": "./",
    "outDir": "./build"
  }
}
```

Vue : 
```json
{
  "extends": "@julr/tooling-configs/tsconfigs/tsconfig.vue",
  "compilerOptions": {
    "rootDir": "./",
    "outDir": "./build"
  }
}
```
