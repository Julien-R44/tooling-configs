import { definePlugin } from '@oxlint/plugins'

import { preferConstructorInjectionRule } from './prefer-constructor-injection.ts'

export default definePlugin({
  meta: { name: 'anti-slop' },
  rules: { 'prefer-constructor-injection': preferConstructorInjectionRule },
})
