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
  jsPlugins: [
    '@julr/tooling-configs/oxc/anti-slop',
    { name: 'jsdoc-js', specifier: 'eslint-plugin-jsdoc' },
  ],
  rules: {
    'jsdoc-js/multiline-blocks': ['error', { noSingleLineBlocks: true, singleLineTags: [] }],
    'anti-slop/expression-complexity': 'error',
    'anti-slop/multiline-arrow-body': 'error',
    'anti-slop/no-await-in-condition': 'error',
    'anti-slop/no-em-dash': 'error',
    'anti-slop/no-jargon': 'error',
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

##### `anti-slop/multiline-arrow-body`

Require braces and an explicit `return` when an arrow expression spans multiple lines, measured from `=>` through the end of its body. Single-line expressions and multiline parameter lists with `=> expression` on one line are allowed.

Incorrect:

```ts
const load = () =>
  fetch(url, {
    signal,
  })
```

Correct:

```ts
const load = () => {
  return fetch(url, {
    signal,
  })
}

const double = value => value * 2
```

**Autofix:** adds a block and an explicit return, preserving comments and parentheses. Run oxfmt after `oxlint --fix` to format the result.

##### `jsdoc-js/multiline-blocks`

Require multiline JSDoc comments, including `@type` and `@lends`. Leave `/**` and `*/` on separate lines without text. Ordinary `/* ... */` and `// ...` comments are unchanged.

Incorrect:

```ts
/** Description. */
```

Correct:

```ts
/**
 * Description.
 */
```

**Autofix:** converts single-line JSDoc blocks with `oxlint --fix`.

Reuses [`eslint-plugin-jsdoc`'s `multiline-blocks`](https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/multiline-blocks.md), enabled by `antiSlop: true`. The `jsdoc-js` alias avoids a name conflict with Oxlint's built-in `jsdoc` plugin. Override it with the `jsdoc-js/multiline-blocks` rule key.

##### `anti-slop/no-await-in-condition`

Disallow `await` in `if` and `else if` conditions, including nested expressions such as `ready && await check()`. Await the result in a named variable before the condition.

```ts
const ready = await check()
if (ready) {
  await run()
}
```

Allows `await` in the body, in nested functions, and outside `if` conditions. No autofix, because extracting an `await` can change short-circuit evaluation.

##### `anti-slop/no-em-dash`

Disallow literal `—` in source text, including strings and comments. Reports once per sentence. Allows `–`, `--`, and escaped `\u2014`. No autofix.

##### `anti-slop/no-jargon`

Disallow inflated words such as `utilize`, `robust`, and `seamless` in comments, including JSDoc. Matches simple inflections; ignores words inside backticks or double quotes. Offers replacement suggestions, not autofixes.

Options: `words` replaces the default list, `extraWords` extends it, `allow` excludes words, and `ignoreJSDoc` skips JSDoc (default: `false`).

```json
{ "anti-slop/no-jargon": ["error", { "allow": ["robust"], "extraWords": ["blazingly"] }] }
```

Both rules are adapted from [eslint-plugin-slop](https://github.com/antfu/eslint-plugin-slop) under MIT.

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
