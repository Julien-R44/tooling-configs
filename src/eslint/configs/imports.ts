import { pluginImport } from '../plugins.js'
import type { ConfigItem } from '../types.js'

export async function imports(): Promise<ConfigItem[]> {
  return [
    {
      name: 'julr:imports',
      plugins: {
        // @ts-expect-error tkt
        import: pluginImport,
      },

      rules: {
        'import/first': 'error',
        'import/no-mutable-exports': 'error',
        'import/no-duplicates': 'error',
        'import/no-named-default': 'error',
        'import/no-self-import': 'error',
        'import/newline-after-import': ['error', { count: 1 }],
      },
    },
  ]
}
