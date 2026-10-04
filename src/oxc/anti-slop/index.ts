import { definePlugin } from '@oxlint/plugins'

import { noJargonRule } from './no-jargon.ts'
import { noEmDashRule } from './no-em-dash.ts'
import { expressionComplexityRule } from './expression-complexity.ts'
import { preferConstructorInjectionRule } from './prefer-constructor-injection.ts'

export default definePlugin({
  meta: { name: 'anti-slop' },
  rules: {
    'expression-complexity': expressionComplexityRule,
    'no-em-dash': noEmDashRule,
    'no-jargon': noJargonRule,
    'prefer-constructor-injection': preferConstructorInjectionRule,
  },
})
