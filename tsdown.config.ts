import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['./src/eslint/index.ts', './src/cli/index.ts', './src/oxc/lint.ts', './src/oxc/fmt.ts'],
  dts: true,
  shims: true,
  clean: true,
  format: ['esm'],
  copy: ['./src/prettier/index.json', './src/tsconfigs'],
  deps: {
    neverBundle: ['oxfmt', 'oxlint', '@eslint/config-helpers', '@eslint/plugin-kit'],
  },
  target: false,
})
