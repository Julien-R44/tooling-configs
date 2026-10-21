import { definePlugin } from '@oxlint/plugins'

import { noJargonRule } from './no-jargon.ts'
import { noEmDashRule } from './no-em-dash.ts'
import { multilineArrowBodyRule } from './multiline-arrow-body.ts'
import { noAwaitInConditionRule } from './no-await-in-condition.ts'
import { expressionComplexityRule } from './expression-complexity.ts'
import { noMultilineInlineParamsRule } from './no-multiline-inline-params.ts'
import { preferConstructorInjectionRule } from './prefer-constructor-injection.ts'

export default definePlugin({
  meta: { name: 'anti-slop' },
  rules: {
    'expression-complexity': expressionComplexityRule,
    'multiline-arrow-body': multilineArrowBodyRule,
    'no-await-in-condition': noAwaitInConditionRule,
    'no-em-dash': noEmDashRule,
    'no-jargon': noJargonRule,
    'no-multiline-inline-params': noMultilineInlineParamsRule,
    'prefer-constructor-injection': preferConstructorInjectionRule,
  },
})
