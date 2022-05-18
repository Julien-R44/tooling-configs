# @julr/eslint-config

## Usage

### Install

```bash
pnpm add -D eslint @julr/eslint-config
```

### Config `.eslintrc`

.eslintrc
```json
{
  "extends": "@julr"
}
```

OR ( preferable ) : 
package.json
```json
{
  // ...
  "eslintConfig": {
    "extends": "@julr"
  }
  // ...
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
