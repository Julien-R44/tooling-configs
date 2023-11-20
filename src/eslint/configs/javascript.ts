import type { ConfigItem } from '../types.js'

export async function javascript(): Promise<ConfigItem[]> {
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
        /**
         * Base eslint - Possibles problems
         */
        'no-unused-vars': 'warn',
        'no-constant-condition': 'warn',
        'no-debugger': 'error',
        'no-cond-assign': ['error', 'always'],

        'no-array-constructor': ['error'],
        'no-unreachable': ['error'],
        'one-var': ['error', 'never'],
        'eqeqeq': ['error', 'always'],
        'no-caller': ['error'],
        'no-control-regex': ['error'],
        'no-duplicate-case': ['error'],
        'no-eval': ['error'],
        'no-ex-assign': ['error'],
        'no-extra-boolean-cast': ['error'],
        'no-fallthrough': ['error'],
        'no-inner-declarations': ['error'],
        'no-invalid-regexp': ['error', { allowConstructorFlags: ['u', 'y'] }],
        'no-proto': ['error'],
        'no-regex-spaces': ['error'],
        'no-self-compare': ['error'],
        'no-sparse-arrays': ['error'],
        'no-unsafe-negation': ['error'],
        'no-new-wrappers': ['error'],
        'no-self-assign': ['error'],
        'no-this-before-super': ['error'],
        'no-with': ['error'],
        'no-undef-init': ['error'],
        'no-unsafe-finally': ['error'],
        'use-isnan': ['error'],
        'valid-typeof': ['error', { requireStringLiterals: true }],
        'curly': ['error', 'all'],

        /**
         * Deprecated
         */
        //  'no-mixed-spaces-and-tabs': ['error'],
        //  'brace-style': ['error', '1tbs'],
        //  'space-in-parens': ['error', 'never'],
        //  'padded-blocks': ['error', 'never'],
        //  'no-trailing-spaces': ['error', { ignoreComments: true }],
        // 'rest-spread-spacing': ['error', 'never'],
        // 'new-parens': ['error', 'always'],
        // 'comma-dangle': ['error', 'always-multiline'],
        // 'eol-last': ['error', 'always'],
        // 'handle-callback-err': ['error', '^(err|error)$'],
        // 'no-multiple-empty-lines': ['error', { max: 1 }],
      },
    },
  ]
}
