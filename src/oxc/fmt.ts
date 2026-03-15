import { defineConfig } from 'oxfmt'

import { IGNORE_PATTERNS } from './shared.js'

type OxfmtOptions = Partial<Parameters<typeof defineConfig>[0]>

export function julrPreset(config: OxfmtOptions = {}): ReturnType<typeof defineConfig> {
  return defineConfig({
    printWidth: 100,
    trailingComma: 'all',
    semi: false,
    useTabs: false,
    singleQuote: true,
    quoteProps: 'consistent',
    bracketSpacing: true,
    arrowParens: 'avoid',
    ignorePatterns: IGNORE_PATTERNS,
    htmlWhitespaceSensitivity: 'ignore',
    ...config,
  })
}
