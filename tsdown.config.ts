import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: [
    './src/cli/index.ts',
    './src/oxc/lint.ts',
    './src/oxc/fmt.ts',
    './src/oxc/anti-slop/index.ts',
  ],
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
