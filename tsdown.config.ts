import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    'oxc/lint': './src/oxc/lint.ts',
    'oxc/fmt': './src/oxc/fmt.ts',
    'oxc/anti-slop/index': './src/oxc/anti-slop/index.ts',
  },
  dts: true,
  shims: true,
  clean: true,
  format: ['esm'],
  copy: ['./src/tsconfigs', { from: './src/oxc/anti-slop/LICENSE', to: './dist/oxc/anti-slop' }],
  deps: {
    neverBundle: ['oxfmt', 'oxlint'],
  },
  target: false,
})
