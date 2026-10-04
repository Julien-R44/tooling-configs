import { defineRule } from '@oxlint/plugins'
import type { ESTree } from '@oxlint/plugins'

type ConditionalExpression = ESTree.LogicalExpression | ESTree.ConditionalExpression

interface ExpressionGroup {
  root: ConditionalExpression
  operators: number
}

export const expressionComplexityRule = defineRule({
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Limit the number of conditional operators in an expression.',
      url: 'https://github.com/Julien-R44/tooling-configs#anti-slopexpression-complexity',
    },
    schema: [
      {
        type: 'object',
        properties: { max: { type: 'integer', minimum: 0 } },
        additionalProperties: false,
      },
    ],
    messages: {
      tooComplex:
        'Reduce the number of conditional operators ({{count}}) in this expression (maximum {{max}}).',
    },
  },
  createOnce(context) {
    let max = 3
    let group: ExpressionGroup | undefined
    const boundaries: (ExpressionGroup | undefined)[] = []

    const enterExpression = (node: ConditionalExpression) => {
      group ??= { root: node, operators: 0 }
      group.operators++
    }

    const exitExpression = (node: ConditionalExpression) => {
      if (group?.root !== node) {
        return
      }

      if (group.operators > max) {
        context.report({
          node,
          messageId: 'tooComplex',
          data: { count: group.operators, max },
        })
      }

      group = undefined
    }

    return {
      'before'() {
        max = (context.options[0] as { max?: number } | undefined)?.max ?? 3
        group = undefined
        boundaries.length = 0
      },
      'LogicalExpression': enterExpression,
      'ConditionalExpression': enterExpression,
      'LogicalExpression:exit': exitExpression,
      'ConditionalExpression:exit': exitExpression,
      // Calls, objects, functions, classes, and JSX have independent expressions.
      ':matches(CallExpression, NewExpression, ObjectExpression, FunctionDeclaration, FunctionExpression, ArrowFunctionExpression, ClassDeclaration, ClassExpression, JSXElement, JSXFragment)'() {
        boundaries.push(group)
        group = undefined
      },
      ':matches(CallExpression, NewExpression, ObjectExpression, FunctionDeclaration, FunctionExpression, ArrowFunctionExpression, ClassDeclaration, ClassExpression, JSXElement, JSXFragment):exit'() {
        group = boundaries.pop()
      },
    }
  },
})
