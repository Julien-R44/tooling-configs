// @ts-check
/* eslint-disable unicorn/prefer-module */

const { defineConfig } = require('eslint-define-config')

module.exports = defineConfig({
  extends: ['@julr/eslint-config-vue', '@julr/eslint-config-prettier'],
})
