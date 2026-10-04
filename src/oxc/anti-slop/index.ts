import { definePlugin } from '@oxlint/plugins'

import { expressionComplexityRule } from './expression-complexity.ts'
import { preferConstructorInjectionRule } from './prefer-constructor-injection.ts'

export default definePlugin({
  meta: { name: 'anti-slop' },
  rules: {
    'expression-complexity': expressionComplexityRule,
    'prefer-constructor-injection': preferConstructorInjectionRule,
  },
})
