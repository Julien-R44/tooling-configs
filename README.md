# @julr/eslint-config

## Usage

### Install

```bash
pnpm add -D eslint prettier @julr/eslint-config
```

#### Available presets

Following presets are available :
- `@julr/eslint-config`: Includes all presets.
- `@julr/eslint-config-basic`: Common rules for most projects.
- `@julr/eslint-config-react`: Rules for React projects.
- `@julr/eslint-config-typescript`: Rules for TypeScript projects.
- `@julr/eslint-config-vue`: Rules for Vue projects.
- `@julr/eslint-config-prettier`: Rules for Prettier.

### Config `.eslintrc`

```jsonc
// .eslintrc
{
  "extends": "@julr"
}
```

> You don't need `.eslintignore` normally as it has been provided by the preset.

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
If prettier is used, a config must be added: 

```jsonc
// package.json
{
  // ...
  "prettier": {
    "trailingComma": "es5",
    "semi": false,
    "singleQuote": true,
    "useTabs": false,
    "quoteProps": "consistent",
    "bracketSpacing": true,
    "arrowParens": "always",
    "printWidth": 100
  }
}
 ```
