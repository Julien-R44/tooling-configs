import { interopDefault } from '../utils.js'
import type { ConfigItem } from '../types.js'

export async function style(): Promise<ConfigItem[]> {
  const plugin = await interopDefault(import('@stylistic/eslint-plugin'))

  return [
    {
      name: 'julr:stylistic',
      plugins: {
        // @ts-expect-error tkt
        '@stylistic': plugin,
      },
      rules: {
        '@stylistic/padding-line-between-statements': [
          'error',
          {
            blankLine: 'always',
            prev: '*',
            next: ['interface', 'type'],
          },
        ],
        '@stylistic/lines-between-class-members': [
          'error',
          'always',
          { exceptAfterSingleLine: true },
        ],
      },
    },
  ]
}
