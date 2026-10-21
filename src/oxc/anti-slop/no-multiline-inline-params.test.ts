import { describe, it } from 'node:test'
import { RuleTester } from 'oxlint/plugins-dev'

import { noMultilineInlineParamsRule } from './no-multiline-inline-params.ts'

RuleTester.describe = describe
RuleTester.it = it

const tester = new RuleTester({
  languageOptions: { parserOptions: { lang: 'ts' } },
})
const errors = [{ messageId: 'useNamedType' }]

tester.run('no-multiline-inline-params', noMultilineInlineParamsRule, {
  valid: [
    'async function execute({ deliveryId, now, enrichment }: ExecuteOptions) {}',
    'function execute({ deliveryId }: { deliveryId: string }) {}',
    'function execute(\n  { deliveryId }: { deliveryId: string }\n) {}',
    'function execute({\n  deliveryId,\n  now\n}: ExecuteOptions) {}',
    'function execute(options:\n  { deliveryId: string }) {}',
    'interface ExecuteOptions {\n  deliveryId: string\n}',
    'type ExecuteOptions = {\n  deliveryId: string\n}',
    'const options: {\n  deliveryId: string\n} = { deliveryId: "id" }',
    'function execute(): {\n  deliveryId: string\n} { return { deliveryId: "id" } }',
    'type Execute = () => {\n  deliveryId: string\n}',
    'class Action { options!: {\n  deliveryId: string\n} }',
    'function execute(options = {\n  deliveryId: "id"\n}) {}',
  ],
  invalid: [
    {
      name: 'reports the type rather than multiline destructuring or defaults',
      code: `class Action {
  async execute({
    deliveryId,
    now,
    enrichment = new EnrichmentService(this.telemetry),
  }: {
    deliveryId: string
    now?: DateTime
    enrichment?: EnrichmentService
  }) {}
}`,
      errors: [{ messageId: 'useNamedType', line: 6, endLine: 10 }],
    },
    {
      name: 'also checks parameters without destructuring',
      code: 'function execute(options: {\n  deliveryId: string\n}) {}',
      errors,
    },
    {
      name: 'checks arrow functions and default parameters',
      code: 'const execute = ({ now }: {\n  now?: DateTime\n} = {}) => now',
      errors,
    },
    {
      name: 'checks function expressions',
      code: 'const execute = function (options: {\n  deliveryId: string\n}) {}',
      errors,
    },
    {
      name: 'checks constructor parameter properties with defaults',
      code: 'class Action { constructor(private options: {\n  now?: DateTime\n} = {}) {} }',
      errors,
    },
    {
      name: 'checks optional parameters in declarations',
      code: 'declare function execute(options?: {\n  now: DateTime\n}): void',
      errors,
    },
    {
      name: 'checks function types',
      code: 'type Execute = (options: {\n  deliveryId: string\n}) => void',
      errors,
    },
    {
      name: 'checks interface method signatures',
      code: 'interface Action { execute(options: {\n  deliveryId: string\n}): void }',
      errors,
    },
    {
      name: 'reports a nested object type only once',
      code: 'function execute(options: {\n  nested: {\n    deliveryId: string\n  }\n}) {}',
      errors,
    },
  ],
})
