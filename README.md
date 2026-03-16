<p align="center">
  <img src="https://user-images.githubusercontent.com/8337858/194765812-05e19fc8-3820-45c5-8d02-fd838d303200.png">
</p>

> [!NOTE]
> Looking for ESLint/Prettier support? We now only support OXC (oxlint + oxfmt). Check the [last commit with ESLint/Prettier](https://github.com/Julien-R44/tooling-configs/tree/d7b363f).

## Features

- Shared presets for [OXC](https://oxc.rs/) tools (oxlint + oxfmt)
- TypeScript configuration presets
- CLI for quick project setup

## Usage

> [!IMPORTANT]
> New/updated rules will not be considered as breaking changes. Only API changes will be considered as breaking changes.

### CLI installation

Just run this command in your project root directory:

```bash
pnpm dlx @julr/tooling-configs@latest
```

### Manual install

```bash
pnpm add -D oxlint oxfmt @julr/tooling-configs
```

### OXC (oxlint + oxfmt)

#### oxlint

```ts
// oxlint.config.ts
import { defineConfig } from 'oxlint'
import { julrPreset } from '@julr/tooling-configs/oxc/lint'

export default defineConfig({
  extends: [julrPreset()],
})
```

Options:

| Option          | Type      | Default | Description                             |
| --------------- | --------- | ------- | --------------------------------------- |
| `adonisjs`      | `boolean` | `false` | Enable AdonisJS-specific rules          |
| `perfectionist` | `boolean` | `false` | Enable import sorting via perfectionist |

```ts
export default defineConfig({
  extends: [julrPreset({ adonisjs: true, perfectionist: true })],
})
```

#### oxfmt

```ts
// oxfmt.config.ts
import { julrPreset } from '@julr/tooling-configs/oxc/fmt'

export default julrPreset()
```

You can override any option:

```ts
export default julrPreset({ printWidth: 120, semi: true })
```

Defaults: `printWidth: 100`, `semi: false`, `singleQuote: true`, `trailingComma: 'all'`, `arrowParens: 'avoid'`.

#### Scripts

```json
{
  "scripts": {
    "lint": "oxlint",
    "lint:fix": "oxlint --fix",
    "format": "oxfmt --write ."
  }
}
```

### Tsconfig

Node (ESM):

```json
{
  "extends": "@julr/tooling-configs/tsconfigs/tsconfig.node",
  "compilerOptions": {
    "rootDir": "./",
    "outDir": "./build"
  }
}
```

Node Next (ESM + `ts` extensions):

```json
{
  "extends": "@julr/tooling-configs/tsconfigs/tsconfig.node-next",
  "compilerOptions": {
    "rootDir": "./",
    "outDir": "./build"
  }
}
```

Vue:

```json
{
  "extends": "@julr/tooling-configs/tsconfigs/tsconfig.vue",
  "compilerOptions": {
    "rootDir": "./",
    "outDir": "./build"
  }
}
```
