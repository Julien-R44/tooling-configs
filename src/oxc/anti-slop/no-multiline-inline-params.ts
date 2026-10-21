import { defineRule } from '@oxlint/plugins'
import type { ESTree } from '@oxlint/plugins'

export const noMultilineInlineParamsRule = defineRule({
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require named types for multiline inline object parameter types.',
      url: 'https://github.com/Julien-R44/tooling-configs#anti-slopno-multiline-inline-params',
    },
    schema: [],
    messages: {
      useNamedType:
        'Extract this multiline object parameter type into a named interface or type alias.',
    },
  },
  createOnce(context) {
    return {
      TSTypeLiteral(node) {
        if (node.loc.start.line === node.loc.end.line || node.parent.type !== 'TSTypeAnnotation') {
          return
        }

        let parameter: ESTree.Node = node.parent.parent
        if (parameter.parent?.type === 'AssignmentPattern' && parameter.parent.left === parameter) {
          parameter = parameter.parent
        }
        if (parameter.parent?.type === 'TSParameterProperty') {
          parameter = parameter.parent
        }

        const owner = parameter.parent
        if (owner && 'params' in owner && owner.params.some(param => param === parameter)) {
          context.report({ node, messageId: 'useNamedType' })
        }
      },
    }
  },
})
