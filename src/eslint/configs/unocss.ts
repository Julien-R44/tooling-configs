import { GLOB_EXCLUDE } from '../globs.js'
import { interopDefault } from '../utils.js'
import type { ConfigItem } from '../types.js'

export async function unocss(): Promise<ConfigItem[]> {
  const unoPlugin = await interopDefault(import('@unocss/eslint-plugin'))

  return [
    {
      name: 'julr:unocss',
      ignores: GLOB_EXCLUDE,
      plugins: {
        '@unocss': unoPlugin as any,
      },
      rules: {
        ...unoPlugin.configs.recommended.rules,
      },
    },
  ]
}
