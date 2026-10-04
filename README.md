<p align="center">
  <img src="https://user-images.githubusercontent.com/8337858/194765812-05e19fc8-3820-45c5-8d02-fd838d303200.png">
</p>

> [!NOTE]
> Looking for ESLint/Prettier support? We now only support OXC (oxlint + oxfmt). Check the [last commit with ESLint/Prettier](https://github.com/Julien-R44/tooling-configs/tree/d7b363f).

## Features

- Shared presets for [OXC](https://oxc.rs/) tools (oxlint + oxfmt)
- `anti-slop` Oxlint plugin to discourage boilerplate in AI-generated code
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

The base preset enables `no-nested-ternary` as an error. Override it in your config's `rules` object if needed.

Options:

| Option          | Type      | Default | Description                             |
| --------------- | --------- | ------- | --------------------------------------- |
| `adonisjs`      | `boolean` | `false` | Enable AdonisJS-specific rules          |
| `antiSlop`      | `boolean` | `false` | Enable anti-slop rules                  |
| `perfectionist` | `boolean` | `false` | Enable import sorting via perfectionist |

```ts
export default defineConfig({
  extends: [julrPreset({ adonisjs: true, antiSlop: true, perfectionist: true })],
})
```

#### Anti-slop rules

Enable all anti-slop rules with `julrPreset({ antiSlop: true })`. They are errors when enabled and can be overridden in your config's `rules` object.

To use the plugin without the preset:

```ts
import { defineConfig } from 'oxlint'

export default defineConfig({
  jsPlugins: ['@julr/tooling-configs/oxc/anti-slop'],
  rules: {
    'anti-slop/expression-complexity': 'error',
    'anti-slop/prefer-constructor-injection': 'error',
  },
})
```

##### `anti-slop/prefer-constructor-injection`

Prefer `private` or `protected` constructor parameter properties in `@inject()` classes instead of redundant fields and assignments.

Incorrect:

```ts
@inject()
class UserService {
  readonly #repository: UserRepository
  constructor(repository: UserRepository) {
    this.#repository = repository
  }
}
```

Correct (`private` is also accepted):

```ts
@inject()
class UserService {
  constructor(protected readonly repository: UserRepository) {}
}
```

**Autofix:** uses `protected`, preserves `readonly`, and updates references. Ambiguous conversions are reported without a fix. Converted `#fields` lose runtime privacy.

##### `anti-slop/expression-complexity`

Limit `&&`, `||`, `??`, and `?:` operators per expression, including `if` conditions. Default: `{ max: 3 }`. Nested functions and calls are analyzed separately. No autofix.

```json
{ "anti-slop/expression-complexity": ["error", { "max": 2 }] }
```

With `max: 2`, `a && b && c` passes; `a && b && c && d` is reported.

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
