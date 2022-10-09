<p align="center">
  <img src="https://user-images.githubusercontent.com/8337858/188330694-486f26d6-1588-4c82-aa72-e6f6fcecc300.png">
</p>

## Usage

### Install

```bash
pnpm add -D eslint prettier @julr/eslint-config @julr/prettier-config
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

```
pnpm add --D @julr/prettier-config
```

```jsonc
// package.json
{
  "prettier": "@julr/prettier-config"
}
```
