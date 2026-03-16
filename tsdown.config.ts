import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['./src/cli/index.ts', './src/oxc/lint.ts', './src/oxc/fmt.ts'],
  dts: true,
  shims: true,
  clean: true,
  format: ['esm'],
  copy: ['./src/tsconfigs'],
  deps: {
    neverBundle: ['oxfmt', 'oxlint'],
  },
  target: false,
})
