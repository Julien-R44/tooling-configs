import cpy from 'cpy'
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['./src/eslint/index.ts', './src/cli/index.ts', './src/oxc/lint.ts', './src/oxc/fmt.ts'],
  external: ['oxfmt', 'oxlint'],
  dts: true,
  shims: true,
  clean: true,
  format: ['esm'],

  async onSuccess() {
    await cpy(['./src/prettier/index.json', './src/tsconfigs'], './dist', {
      flat: false,
    })
  },
})
