import { GLOB_VUE } from '../globs.js'
import { interopDefault } from '../utils.js'
import type { ConfigItem } from '../types.js'

export async function vue(): Promise<ConfigItem[]> {
  const [pluginVue, parserVue] = await Promise.all([
    interopDefault(import('eslint-plugin-vue')),
    interopDefault(import('vue-eslint-parser')),
  ] as const)

  return [
    {
      name: 'julr:vue',
      files: [GLOB_VUE],

      plugins: { vue: pluginVue },
      languageOptions: {
        parser: parserVue,
        parserOptions: {
          ecmaFeatures: { jsx: true },
          extraFileExtensions: ['.vue'],
          parser: (await interopDefault(import('@typescript-eslint/parser'))) as any,
          sourceType: 'module',
        },
      },

      rules: {
        ...(pluginVue.configs.base.rules as any),
        ...(pluginVue.configs['vue3-essential'].rules as any),
        ...(pluginVue.configs['vue3-strongly-recommended'].rules as any),
        ...(pluginVue.configs['vue3-recommended'].rules as any),

        'vue/no-v-html': 'off',
        'vue/require-prop-types': 'off',
        'vue/require-default-prop': 'off',
        'vue/multi-word-component-names': 'off',
        'vue/comment-directive': 'off',

        'vue/block-order': ['error', { order: ['script', 'template', 'style'] }],
        'vue/component-name-in-template-casing': ['error', 'PascalCase'],
        'vue/component-options-name-casing': ['error', 'PascalCase'],
        'vue/custom-event-name-casing': ['error', 'camelCase'],
        'vue/define-macros-order': ['error', { order: ['defineProps', 'defineEmits'] }],
        'vue/html-comment-content-spacing': ['error', 'always', { exceptions: ['-'] }],
        'vue/no-restricted-v-bind': ['error', '/^v-/'],
        'vue/no-useless-v-bind': 'error',
        'vue/no-v-text-v-html-on-component': 'error',
        'vue/padding-line-between-blocks': ['error', 'always'],
        'vue/prefer-separate-static-class': 'error',
        'vue/define-props-declaration': ['error', 'type-based'],
        'vue/dot-notation': ['error', { allowKeywords: true }],
        'vue/eqeqeq': ['error', 'smart'],
        'vue/no-constant-condition': 'warn',
        'vue/no-empty-pattern': 'error',
        'vue/no-irregular-whitespace': 'error',
        'vue/no-loss-of-precision': 'error',
        'vue/no-restricted-syntax': [
          'error',
          'DebuggerStatement',
          'LabeledStatement',
          'WithStatement',
        ],
        'vue/no-sparse-arrays': 'error',
        'vue/object-shorthand': [
          'error',
          'always',
          { ignoreConstructors: false, avoidQuotes: true },
        ],
        'vue/prefer-template': 'error',
      },
    },
  ]
}
