<p align="center">
  <img src="https://user-images.githubusercontent.com/8337858/194765812-05e19fc8-3820-45c5-8d02-fd838d303200.png">
</p>

> [!NOTE]
> Looking for ESLint/Prettier support? We now only support OXC (oxlint + oxfmt). Check the [last commit with ESLint/Prettier](https://github.com/Julien-R44/tooling-configs/tree/d7b363f).

## Features

- Shared presets for [OXC](https://oxc.rs/) tools (oxlint + oxfmt)
- `anti-slop` Oxlint plugin to discourage boilerplate in AI-generated code
- TypeScript configuration presets

## Usage

> [!IMPORTANT]
> New/updated rules will not be considered as breaking changes. Only API changes will be considered as breaking changes.

### Installation

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

Enable all anti-slop rules with `julrPreset({ antiSlop: true })`. They are errors when enabled, except for `complexity`, which is a warning. Override them in your config's `rules` object.

The preset also enables Oxlint's built-in `max-depth` rule with a limit of 3 and `complexity` with a limit of 10. `max-lines-per-function` stays disabled: function length alone does not justify splitting it. `anti-slop/expression-complexity` separately limits logical and ternary operators within individual expressions.

To use the plugin without the preset:

```ts
import { defineConfig } from 'oxlint'

export default defineConfig({
  jsPlugins: [
    '@julr/tooling-configs/oxc/anti-slop',
    { name: 'jsdoc-js', specifier: 'eslint-plugin-jsdoc' },
  ],
  rules: {
    'max-depth': ['error', 3],
    complexity: ['warn', 10],
    'jsdoc-js/multiline-blocks': ['error', { noSingleLineBlocks: true, singleLineTags: [] }],
    'anti-slop/expression-complexity': 'error',
    'anti-slop/multiline-arrow-body': 'error',
    'anti-slop/no-await-in-condition': 'error',
    'anti-slop/no-em-dash': 'error',
    'anti-slop/no-jargon': 'error',
    'anti-slop/no-multiline-inline-params': 'error',
    'anti-slop/prefer-constructor-injection': 'error',
    'anti-slop/prefer-early-return': 'error',
    'anti-slop/prefer-jsdoc': 'error',
    'anti-slop/prefer-logger-err-key': 'error',
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

##### `anti-slop/prefer-early-return`

Prefer a guard clause when the last statement of a function is an `if` without `else` wrapping more than one statement. Earlier statements in the function are allowed. Nested conditionals outside this position are not reported.

```ts
// Incorrect
function execute() {
	if (ready) {
		update()
		notify()
	}
}

// Correct
function execute() {
	if (!ready) return

	update()
	notify()
}
```

Options: `maximumStatements` defaults to `1`. Set it to `0` to report single-statement wrappers too. Empty statements do not count. `checkShortBodies` defaults to `false`; enabling it also prefers conditional wrapping for bodies of one to `maximumStatements` statements after a leading bare-return guard.

**Autofix:** inserts a negated guard and unwraps the body when scope, comments, and multiline literals permit it. Unsafe moves are reported without a fix. Trailing wrapper comments can receive an editor suggestion instead. Run oxfmt after fixing.

Adapted from [`unicorn/prefer-early-return` v76.0.0](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/v76.0.0/docs/rules/prefer-early-return.md) under MIT, without an additional dependency. The port uses local indentation detection and may retain extra condition parentheses.

##### `anti-slop/prefer-logger-err-key`

Require `err` for error values in the first object argument to Pino and Adonis log methods. The default Pino serializer preserves an error's message and stack under this key.

```ts
import logger from '@adonisjs/core/services/logger'

try {
	await run()
} catch (error) {
	logger.error({ error }, 'Failed') // Incorrect
	logger.error({ err: error }, 'Failed') // Correct
	logger.error(error, 'Failed') // Also allowed
}
```

Recognizes the Adonis logger service, default and named Pino factory imports, child loggers, and named `Logger` imports from `pino`, `@adonisjs/logger`, or `@adonisjs/core/logger`. Supports local aliases, typed parameters, and instance fields, including constructor parameter properties.

Checks top-level properties containing catch bindings, built-in error instances, or variables annotated with built-in error types. Strings and error messages are allowed. Applies to `trace`, `debug`, `info`, `warn`, `error`, and `fatal`.

This is a syntax-based check, not TypeScript type analysis. It does not follow cross-file re-exports, unknown factories, HTTP context properties, dynamic keys, object spreads, or custom error subclasses outside catch bindings. Reassigned variables are skipped.

No autofix. The rule assumes Pino's default `err` key and serializers. Disable it for calls that deliberately use a custom `errorKey` or serializer.

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

##### `anti-slop/prefer-jsdoc`

Convert existing `//` documentation before exported declarations and class, interface, type-literal, or enum members to JSDoc. Does not require comments where none exist, add tags, or affect comments inside function bodies.

```ts
// Incorrect
// Fetch a user by ID.
export function fetchUser(id: string) {}

// Correct
/**
 * Fetch a user by ID.
 */
export function fetchUser(id: string) {}
```

**Autofix:** produces multiline JSDoc, even for one-line descriptions, and preserves line endings. Skips directives, license comments, blank-separated file headers, trailing comments, and virtual files. Existing block comments are unchanged. Comments containing `*/` are reported without a fix.

Adapted from [`slop/prefer-jsdoc`](https://github.com/antfu/eslint-plugin-slop/blob/98391afefc5000c0a40dfaf83c647dce479a80ee/src/rules/prefer-jsdoc.md) under MIT. Unlike upstream, this port always emits multiline blocks and checks the full file without Git-inspection options. It works with `jsdoc-js/multiline-blocks` below.

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

##### `anti-slop/no-multiline-inline-params`

Require a named interface or type alias when a parameter's inline object type spans multiple lines. Applies to direct object type annotations on destructured and named parameters, including functions, methods, constructors, and function signatures.

Incorrect:

```ts
async function execute({ deliveryId, now }: {
	deliveryId: string
	now?: DateTime
}) {}
```

Correct:

```ts
interface ExecuteOptions {
	deliveryId: string
	now?: DateTime
}

async function execute({ deliveryId, now }: ExecuteOptions) {}
```

Single-line inline object types are allowed, even when the parameter list spans multiple lines. Return types, variable annotations, and named type definitions are unchanged. No autofix, because the type's name and declaration scope require a choice.

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
