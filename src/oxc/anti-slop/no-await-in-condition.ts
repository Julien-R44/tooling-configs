import { defineRule } from '@oxlint/plugins'
import type { ESTree } from '@oxlint/plugins'

export const noAwaitInConditionRule = defineRule({
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow await expressions in if conditions.',
      url: 'https://github.com/Julien-R44/tooling-configs#anti-slopno-await-in-condition',
    },
    schema: [],
    messages: {
      extractAwait: 'Await the result in a named variable before using it in an if condition.',
    },
  },
  createOnce(context) {
    return {
      AwaitExpression(node) {
        for (let current: ESTree.Node = node; current.parent; current = current.parent) {
          const parent = current.parent
          if (parent.type === 'IfStatement') {
            if (parent.test === current) {
              context.report({ node, messageId: 'extractAwait' })
            }
            return
          }

          if (
            parent.type === 'ArrowFunctionExpression' ||
            parent.type === 'FunctionExpression' ||
            parent.type === 'FunctionDeclaration'
          ) {
            return
          }
        }
      },
    }
  },
})
