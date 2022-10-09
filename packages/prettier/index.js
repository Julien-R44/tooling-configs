/* eslint-disable unicorn/prefer-module */
const { defineConfig } = require('eslint-define-config')

module.exports = defineConfig({
  extends: ['prettier'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'warn',
  },
})
