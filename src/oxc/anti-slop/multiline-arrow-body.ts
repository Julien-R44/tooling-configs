import { defineRule } from '@oxlint/plugins'

export const multilineArrowBodyRule = defineRule({
  meta: {
    type: 'suggestion',
    fixable: 'code',
    docs: {
      description: 'Require a block body and explicit return for multiline arrow expressions.',
      url: 'https://github.com/Julien-R44/tooling-configs#anti-slopmultiline-arrow-body',
    },
    schema: [],
    messages: {
      useBlock: 'Use braces and an explicit return when an arrow expression spans multiple lines.',
    },
  },
  createOnce(context) {
    return {
      ArrowFunctionExpression(node) {
        if (node.body.type === 'BlockStatement') {
          return
        }

        const source = context.sourceCode
        const arrow = source.getTokenBefore(node.body, { filter: token => token.value === '=>' })!
        if (arrow.loc.start.line === node.loc.end.line) {
          return
        }

        context.report({
          node,
          messageId: 'useBlock',
          fix(fixer) {
            // Parentheses preserve sequences and prevent ASI after comments or line breaks.
            return [
              fixer.insertTextAfter(arrow, ' { return ('),
              fixer.insertTextAfter(node, '); }'),
            ]
          },
        })
      },
    }
  },
})
