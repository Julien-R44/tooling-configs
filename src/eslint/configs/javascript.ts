import type { FlatConfigItem } from '../types.js'

export async function javascript(): Promise<FlatConfigItem[]> {
  return [
    {
      name: 'julr:javascript',
      languageOptions: {
        sourceType: 'module',
        ecmaVersion: 2022,
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
          ecmaVersion: 2022,
          sourceType: 'module',
        },
      },

      linterOptions: {
        reportUnusedDisableDirectives: true,
      },

      rules: {
        'prefer-const': 'error',
        'no-unused-vars': [
          'error',
          { ignoreRestSiblings: true, argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
        ],
        'no-constant-condition': 'warn',
        'no-debugger': 'error',
        'no-cond-assign': ['error', 'always'],
        'no-array-constructor': 'error',
        'no-unreachable': 'error',
        'one-var': ['error', 'never'],
        'eqeqeq': ['error', 'always'],
        'no-caller': 'error',
        'no-control-regex': 'error',
        'no-duplicate-case': 'error',
        'no-eval': 'error',
        'no-ex-assign': 'error',
        'no-extra-boolean-cast': 'error',
        'no-fallthrough': 'error',
        'no-inner-declarations': 'error',
        'no-invalid-regexp': ['error', { allowConstructorFlags: ['u', 'y'] }],
        'no-proto': 'error',
        'no-regex-spaces': 'error',
        'no-self-compare': 'error',
        'no-sparse-arrays': 'error',
        'object-shorthand': ['error', 'always', { avoidQuotes: true, ignoreConstructors: false }],
        'no-unsafe-negation': 'error',
        'no-new-wrappers': 'error',
        'no-self-assign': 'error',
        'no-this-before-super': 'error',
        'no-else-return': 'error',
        'no-with': 'error',
        'no-undef-init': 'error',
        'no-unsafe-finally': 'error',
        'use-isnan': 'error',
        'valid-typeof': ['error', { requireStringLiterals: true }],
        'curly': ['error', 'all'],
        'yoda': 'error',
        'capitalized-comments': [
          'error',
          'always',
          {
            line: {
              ignorePattern: '.*',
              ignoreInlineComments: true,
              ignoreConsecutiveComments: true,
            },
          },
        ],
      },
    },
  ]
}
