import { GLOB_EXCLUDE } from '../globs.js'
import { interopDefault } from '../utils.js'
import type { ConfigItem } from '../types.js'

export async function unocss(): Promise<ConfigItem[]> {
  // @ts-expect-error missing types
  const unoPlugin = await interopDefault(import('eslint-plugin-perfectionist'))

  return [
    {
      name: 'julr:unocss',
      ignores: GLOB_EXCLUDE,
      plugins: {
        '@unocss': unoPlugin,
      },
      rules: {
        ...unoPlugin.configs.recommended.rules,
      },
    },
  ]
}
