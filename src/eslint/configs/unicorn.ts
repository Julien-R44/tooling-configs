import { pluginUnicorn } from '../plugins.js'
import type { FlatConfigItem } from '../types.js'

export async function unicorn(): Promise<FlatConfigItem[]> {
  return [
    {
      name: 'julr:unicorn',
      plugins: { unicorn: pluginUnicorn },
      rules: {
        'unicorn/throw-new-error': 'error',
        'unicorn/no-for-loop': 'error',
        'unicorn/no-await-expression-member': 'error',
        'unicorn/filename-case': ['error', { case: 'snakeCase' }],
        'unicorn/prefer-node-protocol': 'error',
        'unicorn/error-message': 'error',
        'unicorn/escape-case': 'error',
        'unicorn/no-instanceof-array': 'error',
        'unicorn/numeric-separators-style': 'error',
        'unicorn/better-regex': 'error',
        'unicorn/custom-error-definition': 'error',
        'unicorn/no-invalid-remove-event-listener': 'error',
        'unicorn/no-new-array': 'error',
        'unicorn/no-new-buffer': 'error',
        'unicorn/no-useless-spread': 'error',
        'unicorn/number-literal-case': 'error',
        'unicorn/prefer-array-find': 'error',
        'unicorn/prefer-dom-node-text-content': 'error',
        'unicorn/prefer-includes': 'error',
        'unicorn/prefer-number-properties': 'error',
        'unicorn/prefer-string-starts-ends-with': 'error',
        'unicorn/prefer-type-error': 'error',
      },
    },
  ]
}
