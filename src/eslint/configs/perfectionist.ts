import { interopDefault } from '../utils.js'
import type { FlatConfigItem } from '../types.js'

export async function perfectionist(): Promise<FlatConfigItem[]> {
  const pluginPerfectionist = await interopDefault(import('eslint-plugin-perfectionist'))

  return [
    {
      name: 'julr:perfectionist',
      plugins: { perfectionist: pluginPerfectionist },

      rules: {
        'perfectionist/sort-imports': [
          'error',
          {
            type: 'line-length',
            order: 'asc',

            internalPattern: ['^@/.*', '^#.*/.*', '^~/.*'],
            groups: [
              // Import 'foo.js' or import 'foo.css'
              ['side-effect', 'side-effect-style'],

              // Packages and node
              ['builtin', 'external'],

              // Others
              ['internal', 'parent', 'sibling', 'index', 'style', 'unknown'],
            ],
          },
        ],

        'perfectionist/sort-enums': ['error', { type: 'line-length', order: 'asc' }],
      },
    },
  ]
}
