import { interopDefault } from '../utils.js'
import type { ConfigItem } from '../types.js'

/**
 * Enable prettier rules
 */
export async function prettier(): Promise<ConfigItem[]> {
  // @ts-expect-error missing types
  const eslintConfigPrettier = await interopDefault(import('eslint-config-prettier'))
  const eslintPluginPrettier = await interopDefault(import('eslint-plugin-prettier'))

  return [
    {
      name: 'julr:prettier',
      plugins: {
        prettier: eslintPluginPrettier,
      },
      rules: {
        ...eslintConfigPrettier.rules,
        // @ts-expect-error wrong types
        ...eslintPluginPrettier.configs!['recommended']!.rules,
        'prettier/prettier': 'warn',
      },
    },
  ]
}
