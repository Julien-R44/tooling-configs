import { interopDefault } from '../utils.js'
import type { ConfigItem } from '../types.js'

export async function adonisjs(): Promise<ConfigItem[]> {
  const adonisjsPlugin = await interopDefault(import('@adonisjs/eslint-plugin'))

  return [
    {
      name: 'julr:adonisjs',
      plugins: {
        // @ts-expect-error tkt
        '@adonisjs': adonisjsPlugin,
      },
      rules: {
        '@adonisjs/prefer-lazy-controller-import': 'error',
        '@adonisjs/prefer-lazy-listener-import': 'error',
      },
    },
  ]
}
