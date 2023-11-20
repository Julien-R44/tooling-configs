import { interopDefault } from '../utils.js'
import type { ConfigItem } from '../types.js'

export async function adonisjs(): Promise<ConfigItem[]> {
  // @ts-expect-error missing types
  const adonisjsPlugin = await interopDefault(import('@adonisjs/eslint-plugin'))

  return [
    {
      name: 'julr:adonisjs',
      plugins: {
        '@adonisjs': adonisjsPlugin,
      },
      rules: {
        '@adonisjs/prefer-lazy-controller-import': 'error',
        '@adonisjs/prefer-lazy-listener-import': 'error',
      },
    },
  ]
}
