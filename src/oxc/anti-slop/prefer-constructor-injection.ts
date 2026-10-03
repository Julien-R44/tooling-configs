import { defineRule } from '@oxlint/plugins'
import type { ESTree, Fix, Fixer } from '@oxlint/plugins'

interface ClassScope {
  body: ESTree.ClassBody
  references: ESTree.PrivateIdentifier[]
  nested: boolean
}

interface CheckParameterOptions {
  scope: ClassScope
  constructor: ESTree.MethodDefinition
  parameter: ESTree.MethodDefinition['value']['params'][number]
}

interface InjectionMapping {
  scope: ClassScope
  constructor: ESTree.MethodDefinition
  parameter: ESTree.BindingIdentifier
  field: ESTree.PropertyDefinition
  statement: ESTree.ExpressionStatement
  name: string
}

function isDependencyAssignment(item: ESTree.Statement) {
  if (item.type !== 'ExpressionStatement' || item.expression.type !== 'AssignmentExpression') {
    return false
  }

  const expression = item.expression

  return (
    expression.operator === '=' &&
    expression.left.type === 'MemberExpression' &&
    !expression.left.computed &&
    expression.left.object.type === 'ThisExpression' &&
    expression.left.property.type === 'PrivateIdentifier' &&
    expression.right.type === 'Identifier'
  )
}

function isUnsupportedField(field: ESTree.PropertyDefinition) {
  return Boolean(field.value || field.static || field.optional || field.decorators.length)
}

export const preferConstructorInjectionRule = defineRule({
  meta: {
    type: 'suggestion',
    fixable: 'code',
    schema: [],
    docs: {
      description:
        'Use private or protected constructor parameter properties for injected dependencies.',
      url: 'https://github.com/Julien-R44/tooling-configs#anti-slopprefer-constructor-injection',
    },
    messages: {
      preferParameterProperty:
        'Declare injected dependencies as private or protected constructor parameter properties.',
    },
  },
  createOnce(context) {
    const scopes: ClassScope[] = []
    const reports: {
      node: ESTree.PropertyDefinition | ESTree.TSParameterProperty
      messageId: string
      fix?: (fixer: Fixer) => Fix[]
    }[] = []

    const checkParameterProperty = (parameter: ESTree.TSParameterProperty) => {
      if (parameter.accessibility === 'protected' || parameter.accessibility === 'private') {
        return
      }

      reports.push({
        node: parameter,
        messageId: 'preferParameterProperty',
        fix(fixer) {
          const decoratorEnd = parameter.decorators.at(-1)?.range[1] ?? parameter.range[0]
          const modifier = context.sourceCode.getFirstToken(parameter, {
            filter: token => token.range[0] >= decoratorEnd,
          })!

          return [
            parameter.accessibility === 'public'
              ? fixer.replaceText(modifier, 'protected')
              : fixer.insertTextBefore(modifier, 'protected '),
          ]
        },
      })
    }

    const canFix = (options: InjectionMapping) => {
      const { scope, constructor, parameter, field, statement, name } = options
      const source = context.sourceCode
      const annotationsMatch =
        field.typeAnnotation &&
        source.getText(field.typeAnnotation) === source.getText(parameter.typeAnnotation)
      const collision = scope.body.body.some(
        member =>
          'key' in member &&
          member !== field &&
          ((member.key.type === 'Identifier' && member.key.name === parameter.name) ||
            (member.key.type === 'Literal' && member.key.value === parameter.name) ||
            member.computed),
      )
      const hasComments = [field, statement].some(
        node =>
          source.getCommentsInside(node).length ||
          source.getCommentsBefore(node).length ||
          source.getCommentsAfter(node).length,
      )
      const initializers = scope.body.body.some(
        member =>
          (member.type === 'PropertyDefinition' || member.type === 'AccessorProperty') &&
          !member.static &&
          member.value,
      )
      const brandChecks = scope.references.some(
        reference => reference.name === name && reference.parent.type === 'BinaryExpression',
      )
      const statements = constructor.value.body?.body ?? []
      const simple = statements.every(isDependencyAssignment)
      const assignments = statements.filter(
        item =>
          item.type === 'ExpressionStatement' &&
          item.expression.type === 'AssignmentExpression' &&
          item.expression.left.type === 'MemberExpression' &&
          item.expression.left.property.type === 'PrivateIdentifier' &&
          item.expression.left.property.name === name,
      )
      const parameterAssignments = statements.filter(
        item =>
          item.type === 'ExpressionStatement' &&
          item.expression.type === 'AssignmentExpression' &&
          item.expression.right.type === 'Identifier' &&
          item.expression.right.name === parameter.name,
      )

      return [
        !scope.nested,
        !isUnsupportedField(field),
        !parameter.decorators?.length,
        annotationsMatch,
        !collision,
        !hasComments,
        simple,
        !initializers,
        !brandChecks,
        assignments.length === 1,
        parameterAssignments.length === 1,
      ].every(Boolean)
    }

    const reportMapping = (options: InjectionMapping) => {
      const { scope, parameter, field, statement, name } = options
      const report: (typeof reports)[number] = {
        node: field,
        messageId: 'preferParameterProperty',
      }

      if (canFix(options)) {
        report.fix = fixer => [
          fixer.remove(field),
          fixer.remove(statement),
          fixer.insertTextBefore(parameter, field.readonly ? 'protected readonly ' : 'protected '),
          ...scope.references
            .filter(
              reference =>
                reference.name === name &&
                reference !== field.key &&
                (reference.range[0] < statement.range[0] ||
                  reference.range[0] >= statement.range[1]),
            )
            .map(reference => fixer.replaceText(reference, parameter.name)),
        ]
      }

      reports.push(report)
    }

    const checkParameter = (options: CheckParameterOptions) => {
      const { scope, constructor, parameter } = options

      if (parameter.type === 'TSParameterProperty') {
        checkParameterProperty(parameter)
        return
      }

      if (parameter.type !== 'Identifier' || !parameter.typeAnnotation) {
        return
      }

      const statement = constructor.value.body?.body.find(
        item =>
          isDependencyAssignment(item) &&
          item.type === 'ExpressionStatement' &&
          item.expression.type === 'AssignmentExpression' &&
          item.expression.right.type === 'Identifier' &&
          item.expression.right.name === parameter.name &&
          item.expression.left.type === 'MemberExpression' &&
          item.expression.left.property.type === 'PrivateIdentifier',
      )

      if (
        !statement ||
        statement.type !== 'ExpressionStatement' ||
        statement.expression.type !== 'AssignmentExpression'
      ) {
        return
      }

      const target = statement.expression.left
      if (target.type !== 'MemberExpression' || target.property.type !== 'PrivateIdentifier') {
        return
      }

      const name = target.property.name
      const field = scope.body.body.find(
        member =>
          member.type === 'PropertyDefinition' &&
          member.key.type === 'PrivateIdentifier' &&
          member.key.name === name,
      )

      if (!field || field.type !== 'PropertyDefinition') {
        return
      }

      reportMapping({ scope, constructor, parameter, field, statement, name })
    }

    return {
      'before'() {
        scopes.length = 0
        reports.length = 0
      },
      'ClassBody'(node) {
        const parent = scopes.at(-1)
        if (parent) {
          parent.nested = true
        }

        scopes.push({ body: node, references: [], nested: false })
      },
      'PrivateIdentifier'(node) {
        scopes.at(-1)?.references.push(node)
      },
      'ClassBody:exit'() {
        const scope = scopes.pop()!
        const owner = scope.body.parent
        if (owner.type !== 'ClassDeclaration' && owner.type !== 'ClassExpression') {
          return
        }

        if (
          !owner.decorators.some(
            decorator =>
              decorator.expression.type === 'CallExpression' &&
              decorator.expression.callee.type === 'Identifier' &&
              decorator.expression.callee.name === 'inject',
          )
        ) {
          return
        }

        const constructor = scope.body.body.find(
          member => member.type === 'MethodDefinition' && member.kind === 'constructor',
        )
        if (!constructor || constructor.type !== 'MethodDefinition') {
          return
        }

        reports.length = 0
        for (const parameter of constructor.value.params) {
          checkParameter({ scope, constructor, parameter })
        }

        const fixable = reports.filter(report => report.fix)
        for (const report of reports.filter(item => !item.fix)) {
          context.report(report)
        }

        if (fixable.length) {
          context.report({
            ...fixable[0]!,
            fix: fixer => fixable.flatMap(report => report.fix!(fixer) ?? []),
          })
        }
      },
    }
  },
})
