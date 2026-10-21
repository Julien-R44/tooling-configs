import { defineRule } from '@oxlint/plugins'
import type { ESTree } from '@oxlint/plugins'

const loggerModules = new Set(['pino', '@adonisjs/logger', '@adonisjs/core/logger'])
const pinoModules = new Set(['pino'])
const serviceModules = new Set(['@adonisjs/core/services/logger'])
const logMethods = new Set(['trace', 'debug', 'info', 'warn', 'error', 'fatal'])
const errorClasses = new Set([
  'Error',
  'TypeError',
  'RangeError',
  'ReferenceError',
  'SyntaxError',
  'URIError',
  'EvalError',
  'AggregateError',
])

function keyName(node: ESTree.Node): string | undefined {
  if (node.type === 'Identifier' || node.type === 'PrivateIdentifier') return node.name
  if (node.type === 'Literal' && typeof node.value === 'string') return node.value

  return undefined
}

function memberName(node: ESTree.Node): string | undefined {
  if (node.type !== 'MemberExpression') return undefined
  if (node.computed && node.property.type !== 'Literal') return undefined

  return keyName(node.property)
}

export const preferLoggerErrKeyRule = defineRule({
  meta: {
    type: 'problem',
    docs: {
      description: 'Use the err key for errors in Pino and Adonis logger objects.',
      url: 'https://github.com/Julien-R44/tooling-configs#anti-slopprefer-logger-err-key',
    },
    schema: [],
    messages: {
      useErrKey:
        'Log this error under the "err" key so the default Pino error serializer preserves its message and stack.',
    },
  },
  createOnce(context) {
    function variable(node: ESTree.Node) {
      if (node.type !== 'Identifier') return undefined
      let scope: ReturnType<typeof context.sourceCode.getScope> | null =
        context.sourceCode.getScope(node)
      for (; scope; scope = scope.upper) {
        const found = scope.set.get(node.name)
        if (found) return found
      }
      return undefined
    }

    function imported(node: ESTree.Node, modules: Set<string>, name: string) {
      const definition = variable(node)?.defs[0]
      if (definition?.type !== 'ImportBinding') return false
      const specifier = definition.node
      const declaration = specifier.parent
      if (declaration?.type !== 'ImportDeclaration' || !modules.has(declaration.source.value)) {
        return false
      }
      return (
        (specifier.type === 'ImportDefaultSpecifier' && name === 'default') ||
        (specifier.type === 'ImportSpecifier' && keyName(specifier.imported) === name)
      )
    }

    function hasType(node: ESTree.Node, kind: 'logger' | 'error') {
      if (!('typeAnnotation' in node) || node.typeAnnotation?.type !== 'TSTypeAnnotation')
        return false
      const type = node.typeAnnotation.typeAnnotation
      if (type?.type !== 'TSTypeReference' || type.typeName.type !== 'Identifier') return false
      if (kind === 'logger') return imported(type.typeName, loggerModules, 'Logger')

      return errorClasses.has(type.typeName.name) && !variable(type.typeName)?.defs.length
    }

    function classLogger(node: ESTree.MemberExpression, seen: Set<ESTree.Node>): boolean {
      const name = memberName(node)
      if (name === undefined) return false
      for (let current: ESTree.Node = node; current.parent; current = current.parent) {
        if (
          current.type === 'FunctionDeclaration' ||
          (current.type === 'FunctionExpression' && current.parent.type !== 'MethodDefinition') ||
          ((current.type === 'MethodDefinition' || current.type === 'PropertyDefinition') &&
            current.static) ||
          current.type === 'StaticBlock'
        ) {
          return false
        }
        if (current.type !== 'ClassBody') continue
        for (const member of current.body) {
          if (
            member.type === 'PropertyDefinition' &&
            !member.static &&
            !member.computed &&
            keyName(member.key) === name &&
            (member.key.type === 'PrivateIdentifier') ===
              (node.property.type === 'PrivateIdentifier')
          ) {
            return (
              hasType(member, 'logger') ||
              (member.value !== null && isValue(member.value, 'logger', seen))
            )
          }
          if (member.type !== 'MethodDefinition' || member.kind !== 'constructor') continue
          for (const parameter of member.value.params) {
            if (parameter.type !== 'TSParameterProperty') continue
            const binding =
              parameter.parameter.type === 'AssignmentPattern'
                ? parameter.parameter.left
                : parameter.parameter
            if (
              binding.type === 'Identifier' &&
              binding.name === name &&
              node.property.type !== 'PrivateIdentifier'
            ) {
              return hasType(binding, 'logger')
            }
          }
        }
        return false
      }
      return false
    }

    function isValue(
      node: ESTree.Node,
      kind: 'logger' | 'error',
      seen = new Set<ESTree.Node>(),
    ): boolean {
      if (seen.has(node)) return false
      seen.add(node)
      if (
        node.type === 'TSAsExpression' ||
        node.type === 'TSNonNullExpression' ||
        node.type === 'TSSatisfiesExpression' ||
        node.type === 'ChainExpression'
      ) {
        return isValue(node.expression, kind, seen)
      }
      if (kind === 'logger') {
        if (imported(node, serviceModules, 'default')) return true
        if (node.type === 'CallExpression') {
          if (
            imported(node.callee, pinoModules, 'default') ||
            imported(node.callee, pinoModules, 'pino')
          )
            return true
          if (node.callee.type === 'MemberExpression' && memberName(node.callee) === 'child') {
            return isValue(node.callee.object, kind, seen)
          }
        }
        if (node.type === 'NewExpression' && imported(node.callee, loggerModules, 'Logger'))
          return true
        if (node.type === 'MemberExpression' && node.object.type === 'ThisExpression') {
          return classLogger(node, seen)
        }
      } else if (node.type === 'NewExpression' && node.callee.type === 'Identifier') {
        return errorClasses.has(node.callee.name) && !variable(node.callee)?.defs.length
      }
      const binding = variable(node)
      if (!binding || binding.references.some(reference => reference.isWrite() && !reference.init))
        return false
      const definition = binding.defs[0]
      if (!definition) return false
      if (
        kind === 'error' &&
        definition.type === 'CatchClause' &&
        definition.node.type === 'CatchClause' &&
        definition.node.param?.type === 'Identifier'
      )
        return true
      if (hasType(definition.name, kind)) return true
      if (
        definition.node.type === 'VariableDeclarator' &&
        definition.node.id.type === 'Identifier' &&
        definition.node.init
      )
        return isValue(definition.node.init, kind, seen)
      return false
    }

    return {
      CallExpression(node) {
        const callee = node.callee
        const object = node.arguments[0]
        if (
          callee.type !== 'MemberExpression' ||
          !logMethods.has(memberName(callee) ?? '') ||
          object?.type !== 'ObjectExpression' ||
          !isValue(callee.object, 'logger')
        )
          return

        for (const property of object.properties) {
          if (property.type !== 'Property' || property.kind !== 'init' || property.method) continue
          if (property.computed && property.key.type !== 'Literal') continue
          if (keyName(property.key) === 'err' || !isValue(property.value, 'error')) continue
          context.report({ node: property, messageId: 'useErrKey' })
        }
      },
    }
  },
})
