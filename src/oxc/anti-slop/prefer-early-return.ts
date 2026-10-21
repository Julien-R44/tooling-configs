// Adapted from eslint-plugin-unicorn v76.0.0 (MIT). See LICENSE.
import { defineRule } from '@oxlint/plugins'
import type { ESTree, FixFn, Scope, SourceCode } from '@oxlint/plugins'

interface Options {
  maximumStatements?: number
  checkShortBodies?: boolean
}

type FunctionNode = ESTree.Function | ESTree.ArrowFunctionExpression

const blockScopedDeclarations = new Set([
  'ClassDeclaration',
  'FunctionDeclaration',
  'TSDeclareFunction',
  'TSEnumDeclaration',
  'TSImportEqualsDeclaration',
  'TSInterfaceDeclaration',
  'TSModuleDeclaration',
  'TSTypeAliasDeclaration',
])

function isBlockScoped(node: ESTree.Node): boolean {
  return (
    (node.type === 'VariableDeclaration' && node.kind !== 'var') ||
    blockScopedDeclarations.has(node.type)
  )
}

function statements(node: ESTree.Statement) {
  return node.type === 'BlockStatement' ? node.body : [node]
}

function isInside(node: { range: [number, number] }, range: [number, number]) {
  return node.range[0] >= range[0] && node.range[1] <= range[1]
}

function reindent(text: string, from: string, to: string) {
  return text.replaceAll(
    /(\r\n|[\n\r\u2028\u2029])([^\n\r\u2028\u2029]*)/gu,
    (_, linebreak: string, line: string) => {
      if (line.trim() === '') return linebreak
      if (line.startsWith(from)) return linebreak + to + line.slice(from.length)

      return linebreak + line
    },
  )
}

function hasDirectEval(node: ESTree.Node, source: SourceCode): boolean {
  if (
    node.type === 'CallExpression' &&
    !node.optional &&
    node.callee.type === 'Identifier' &&
    node.callee.name === 'eval'
  )
    return true

  const children = node as unknown as Record<string, ESTree.Node | ESTree.Node[] | null>
  return (source.visitorKeys[node.type] ?? []).some(key => {
    const child = children[key]
    return Array.isArray(child)
      ? child.some(element => element && hasDirectEval(element, source))
      : !!child && hasDirectEval(child, source)
  })
}

function isLabeledFunction(node: ESTree.Node): boolean {
  return (
    node.type === 'LabeledStatement' &&
    (node.body.type === 'FunctionDeclaration' || isLabeledFunction(node.body))
  )
}

export const preferEarlyReturnRule = defineRule({
  meta: {
    type: 'suggestion',
    fixable: 'code',
    hasSuggestions: true,
    docs: {
      description:
        'Prefer early returns over conditionals wrapping the remainder of the function body.',
      url: 'https://github.com/Julien-R44/tooling-configs#anti-slopprefer-early-return',
    },
    schema: [
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          maximumStatements: { type: 'integer', minimum: 0 },
          checkShortBodies: { type: 'boolean' },
        },
      },
    ],
    messages: {
      'prefer-early-return':
        'Prefer an early return over wrapping the remainder of the function body in an `if` statement.',
      'prefer-early-return/suggestion': 'Rewrite to an early return.',
      'prefer-early-return/short-body':
        'Prefer conditional wrapping over an early return for a short body.',
    },
  },
  createOnce(context) {
    let source: SourceCode
    let maximumStatements = 1
    let checkShortBodies = false
    let indentUnit: string | undefined
    let linebreak = '\n'

    function lineIndent(node: { loc: { start: { line: number } } }) {
      return /^[\t ]*/u.exec(source.lines[node.loc.start.line - 1]!)![0]
    }

    function getIndentUnit() {
      if (indentUnit !== undefined) return indentUnit

      // Ignore continuation lines of comments, strings, templates, and JSX text.
      const lines = [...source.lines]
      for (const token of source.getTokens(source.ast, { includeComments: true })) {
        if (token.loc.start.line !== token.loc.end.line) {
          lines.fill('', token.loc.start.line, token.loc.end.line)
        }
      }
      const counts = new Map<string, number>()
      let previous = ''
      for (const line of lines) {
        if (!line.trim()) continue

        const indent = /^[\t ]*/u.exec(line)![0]
        const step =
          indent.length > previous.length && indent.startsWith(previous)
            ? indent.slice(previous.length)
            : ''
        if (step) counts.set(step, (counts.get(step) ?? 0) + 1)
        previous = indent
      }
      indentUnit = [...counts].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '\t'

      return indentUnit
    }

    function conditionRange(node: ESTree.IfStatement): [number, number] {
      return [
        source.getTokenAfter(source.getFirstToken(node)!)!.range[1],
        source.getTokenBefore(node.consequent)!.range[0],
      ]
    }

    function negate(node: ESTree.IfStatement) {
      const range = conditionRange(node)
      if (
        source
          .getCommentsInside(node)
          .some(comment => isInside(comment, range) && !isInside(comment, node.test.range))
      ) {
        return `!(${source.text.slice(...range).trimStart()})`
      }
      const test = node.test
      if (test.type === 'UnaryExpression' && test.operator === '!') {
        return source.text.slice(source.getFirstToken(test)!.range[1], test.range[1]).trim()
      }
      const text = source.getText(test)
      if (
        [
          'Identifier',
          'Literal',
          'ThisExpression',
          'MemberExpression',
          'CallExpression',
          'UnaryExpression',
          'AwaitExpression',
          'ChainExpression',
        ].includes(test.type)
      )
        return `!${text}`

      return `!(${text})`
    }

    function hasMultilineToken(node: ESTree.Node) {
      return source.getTokens(node).some(token => token.loc.start.line !== token.loc.end.line)
    }

    function canMoveLexicalDeclarations(node: ESTree.IfStatement, fn: FunctionNode) {
      const variables = statements(node.consequent).flatMap(statement => {
        if (statement.type !== 'VariableDeclaration' || !['let', 'const'].includes(statement.kind))
          return []

        return source.getDeclaredVariables(statement)
      })
      if (variables.length === 0) return true
      if (
        (node.parent as ESTree.BlockStatement).body.length > 1 ||
        hasDirectEval(node.test, source)
      )
        return false

      const names = new Set(variables.map(variable => variable.name))
      if (
        source.scopeManager.acquire(fn, true)!.variables.some(variable => names.has(variable.name))
      ) {
        return false
      }
      function hasReference(scope: Scope): boolean {
        return (
          scope.references.some(
            reference =>
              isInside(reference.identifier, node.test.range) &&
              names.has(reference.identifier.name) &&
              !reference.resolved?.identifiers.some(identifier =>
                isInside(identifier, node.test.range),
              ),
          ) || scope.childScopes.some(hasReference)
        )
      }

      return !hasReference(source.getScope(node.test))
    }

    function canRewrite(node: ESTree.IfStatement, fn: FunctionNode) {
      if (
        statements(node.consequent).some(
          statement =>
            isBlockScoped(statement) &&
            !(
              statement.type === 'VariableDeclaration' && ['let', 'const'].includes(statement.kind)
            ),
        )
      )
        return false
      if (!canMoveLexicalDeclarations(node, fn) || hasMultilineToken(node.consequent)) return false
      if (
        node.consequent.type !== 'BlockStatement' &&
        source.getText(node.consequent).includes('\n')
      )
        return false

      const range = conditionRange(node)
      return !source
        .getCommentsInside(node)
        .some(comment => !isInside(comment, range) && !isInside(comment, node.consequent.range))
    }

    function replacement(node: ESTree.IfStatement) {
      const indent = lineIndent(node)
      let body = indent + source.getText(node.consequent)
      if (node.consequent.type === 'BlockStatement') {
        const opening = source.getFirstToken(node.consequent)!
        const closing = source.getLastToken(node.consequent)!
        const first = source.getTokenAfter(opening, { includeComments: true })!
        const text = source.text.slice(opening.range[1], closing.range[0])
        body = indent + reindent(text, lineIndent(first), indent).trim()
      }

      return `if (${negate(node)}) {${linebreak}${indent}${getIndentUnit()}return;${linebreak}${indent}}${linebreak}${linebreak}${body}`
    }

    function shortBodyFix(guard: ESTree.IfStatement, body: ESTree.Statement[]): FixFn | undefined {
      const last = guard.alternate ? guard : body.at(-1)!
      const range: [number, number] = [guard.range[0], last.range[1]]
      if (
        source.getAllComments().some(comment => isInside(comment, range)) ||
        source.getCommentsAfter(last).length > 0
      )
        return undefined

      const replace =
        (text: string): FixFn =>
        fixer => [
          fixer.insertTextBefore(guard.parent.parent!, ''),
          fixer.replaceTextRange(range, text),
        ]
      if (guard.alternate?.type === 'BlockStatement') {
        return replace(`if (${negate(guard)}) ${source.getText(guard.alternate)}`)
      }
      if (
        body.some(
          statement =>
            isBlockScoped(statement) ||
            isLabeledFunction(statement) ||
            hasMultilineToken(statement),
        )
      )
        return undefined

      const indent = lineIndent(guard)
      const bodyIndent = indent + getIndentUnit()
      const text = source.text.slice(body[0]!.range[0], body.at(-1)!.range[1])
      const bodyText = reindent(text, lineIndent(body[0]!), bodyIndent)

      return replace(
        `if (${negate(guard)}) {${linebreak}${bodyIndent}${bodyText}${linebreak}${indent}}`,
      )
    }

    function checkShortBody(block: ESTree.BlockStatement) {
      if (!checkShortBodies || maximumStatements === 0) return false

      const guard = block.body[0]
      if (
        guard?.type !== 'IfStatement' ||
        guard.alternate?.type === 'IfStatement' ||
        (guard.alternate && block.body.length !== 1)
      )
        return false

      const exits = statements(guard.consequent)
      if (exits.length !== 1 || exits[0]!.type !== 'ReturnStatement' || exits[0]!.argument)
        return false

      const body = guard.alternate ? statements(guard.alternate) : block.body.slice(1)
      const count = body.filter(statement => statement.type !== 'EmptyStatement').length
      if (count === 0 || count > maximumStatements) return false

      const fix = shortBodyFix(guard, body)
      context.report({
        node: guard,
        messageId: 'prefer-early-return/short-body',
        ...(fix && { fix }),
      })

      return true
    }

    function checkFunction(node: FunctionNode) {
      if (node.body?.type !== 'BlockStatement' || checkShortBody(node.body)) return

      const last = node.body.body.at(-1)
      if (
        last?.type !== 'IfStatement' ||
        last.alternate ||
        statements(last.consequent).filter(statement => statement.type !== 'EmptyStatement')
          .length <= maximumStatements
      )
        return

      const fix: FixFn | undefined = canRewrite(last, node)
        ? fixer => fixer.replaceText(last, replacement(last))
        : undefined
      const canFix = source.getCommentsAfter(last).length === 0
      context.report({
        node: last,
        messageId: 'prefer-early-return',
        ...(fix && canFix && { fix }),
        ...(fix && !canFix && { suggest: [{ messageId: 'prefer-early-return/suggestion', fix }] }),
      })
    }

    return {
      before() {
        source = context.sourceCode
        const options = context.options[0] as Options | undefined
        maximumStatements = options?.maximumStatements ?? 1
        checkShortBodies = options?.checkShortBodies ?? false
        indentUnit = undefined
        linebreak = source.text.match(/\r\n|[\n\r\u2028\u2029]/u)?.[0] ?? '\n'
      },
      FunctionDeclaration: checkFunction,
      FunctionExpression: checkFunction,
      ArrowFunctionExpression: checkFunction,
    }
  },
})
