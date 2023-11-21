import { interopDefault } from '../utils.js'
import type { ConfigItem } from '../types.js'

export async function perfectionist(): Promise<ConfigItem[]> {
  // @ts-expect-error missing types
  const pluginPerfectionist = await interopDefault(import('eslint-plugin-perfectionist'))

  return [
    {
      name: 'julr:perfectionist',
      plugins: { perfectionist: pluginPerfectionist },

      rules: {
        'perfectionist/sort-imports': [
          'error',
          {
            'type': 'line-length',
            'order': 'asc',

            'internal-pattern': ['@/**', '#*/**'],
            'groups': [
              // Import 'foo.js' or import 'foo.css'
              ['side-effect', 'side-effect-style'],

              // Packages and node
              ['builtin', 'external', 'builtin-type', 'external-type'],

              // Others
              [
                'internal-type',
                'internal',
                'parent-type',
                'sibling-type',
                'index-type',
                'parent',
                'sibling',
                'index',
                'style',
                'object',
                'unknown',
              ],
            ],
          },
        ],
      },
    },
  ]
}
