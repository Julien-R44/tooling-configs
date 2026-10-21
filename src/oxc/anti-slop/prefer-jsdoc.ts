// Adapted from antfu/eslint-plugin-slop (MIT). See LICENSE.
import { defineRule } from '@oxlint/plugins'
import type { Comment, ESTree } from '@oxlint/plugins'

const directive =
  /^\/?\s*(?:eslint\b|@?ts-|globals?\b|exported\b|prettier-ignore\b|[cv]8\b|istanbul\b|biome-ignore\b|oxlint\b|noinspection\b)/u
const referenceDirective = /^\/\s*<reference\b/u
const license = /copyright|license|spdx|©/iu

export const preferJsdocRule = defineRule({
  meta: {
    type: 'suggestion',
    fixable: 'code',
    docs: {
      description: 'Use JSDoc for existing comments documenting exports and members.',
      url: 'https://github.com/Julien-R44/tooling-configs#anti-slopprefer-jsdoc',
    },
    schema: [],
    messages: {
      preferJsdoc: 'Document this with a /** */ block so editors show it on hover.',
    },
  },
  createOnce(context) {
    function check(node: ESTree.Node) {
      if (context.filename !== context.physicalFilename) return

      const source = context.sourceCode
      const text = source.text
      const before = source.getCommentsBefore(node)
      const run: Comment[] = []
      for (let i = before.length - 1; i >= 0; i--) {
        const comment = before[i]!
        if (comment.type !== 'Line') break
        if (run[0] && comment.loc.end.line + 1 !== run[0].loc.start.line) break

        run.unshift(comment)
      }
      const first = run[0]
      const last = run.at(-1)
      if (!first || !last) return

      const prefix = (item: Comment | ESTree.Node) =>
        text.slice(item.range[0] - item.loc.start.column, item.range[0])
      if (run.some(comment => /\S/u.test(prefix(comment))) || /\S/u.test(prefix(node))) return
      if (/\S/u.test(text.slice(last.range[1], node.range[0]))) return
      if (
        run.some(comment => directive.test(comment.value) || referenceDirective.test(comment.value))
      )
        return

      const runText = run.map(comment => comment.value).join('\n')
      if (license.test(runText)) return
      if (
        text.slice(0, first.range[0]).trim() === '' &&
        node.loc.start.line - last.loc.end.line > 1
      )
        return

      const linebreak = text.match(/\r\n|[\n\r\u2028\u2029]/u)?.[0] ?? '\n'
      const indent = prefix(first)
      const body = run
        .map(comment => {
          const line = comment.value.trim()
          return line ? `${indent} * ${line}` : `${indent} *`
        })
        .join(linebreak)

      context.report({
        loc: { start: first.loc.start, end: last.loc.end },
        messageId: 'preferJsdoc',
        // A literal closing delimiter cannot be copied into a block comment safely.
        ...(!runText.includes('*/') && {
          fix: fixer =>
            fixer.replaceTextRange(
              [first.range[0], node.range[0]],
              `/**${linebreak}${body}${linebreak}${indent} */${linebreak}${prefix(node)}`,
            ),
        }),
      })
    }

    return {
      ExportNamedDeclaration(node) {
        if (node.declaration) check(node)
      },
      ExportDefaultDeclaration: check,
      PropertyDefinition: check,
      MethodDefinition: check,
      TSPropertySignature: check,
      TSMethodSignature: check,
      TSIndexSignature: check,
      TSAbstractPropertyDefinition: check,
      TSAbstractMethodDefinition: check,
      TSEnumMember: check,
    }
  },
})
