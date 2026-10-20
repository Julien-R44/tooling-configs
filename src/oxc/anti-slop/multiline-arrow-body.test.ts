import { describe, it } from 'node:test'
import { RuleTester } from 'oxlint/plugins-dev'

import { multilineArrowBodyRule } from './multiline-arrow-body.ts'

RuleTester.describe = describe
RuleTester.it = it

const tester = new RuleTester({
  languageOptions: { parserOptions: { lang: 'ts' } },
  recursive: true,
})
const errors = [{ messageId: 'useBlock' }]

tester.run('multiline-arrow-body', multilineArrowBodyRule, {
  valid: [
    'const double = value => value * 2',
    'const make = () => ({ value: 1 })',
    'const load = async () => await fetch(url)',
    'const run = () => {\n  return fetch(url)\n}',
    'const run = () => { fetch(url) }',
    'const select = (\n  first,\n  second,\n) => first + second',
    'const run = function () {\n  return fetch(url)\n}',
  ],
  invalid: [
    {
      name: 'requires braces even when only the line break after the arrow makes it multiline',
      code: 'const run = () =>\n  fetch(url)',
      output: 'const run = () => { return (\n  fetch(url)); }',
      errors: [{ messageId: 'useBlock', line: 1, endLine: 2 }],
    },
    {
      name: 'fixes multiline calls starting on the arrow line',
      code: 'const run = () => fetch(url, {\n  signal,\n})',
      output: 'const run = () => { return ( fetch(url, {\n  signal,\n})); }',
      errors,
    },
    {
      name: 'fixes callbacks returning new expressions as well as calls',
      code: 'Result.try({ catch: cause =>\n  new DomainError({ cause }) })',
      output: 'Result.try({ catch: cause => { return (\n  new DomainError({ cause })); } })',
      errors,
    },
    {
      name: 'preserves parenthesized object returns',
      code: 'const make = () => ({\n  value: 1,\n})',
      output: 'const make = () => { return ( ({\n  value: 1,\n})); }',
      errors,
    },
    {
      name: 'counts parentheses around an otherwise single-line expression',
      code: 'const select = () => (\n  value\n)',
      output: 'const select = () => { return ( (\n  value\n)); }',
      errors,
    },
    {
      name: 'keeps line comments after the arrow without changing the return value',
      code: 'const run = () => // keep the response\n  fetch(url)',
      output: 'const run = () => { return ( // keep the response\n  fetch(url)); }',
      errors,
    },
    {
      name: 'preserves sequence expressions and comments inside parentheses',
      code: 'const run = () => (\n  first(),\n  second() // last result\n)',
      output: 'const run = () => { return ( (\n  first(),\n  second() // last result\n)); }',
      errors,
    },
    {
      name: 'preserves async and TypeScript return types containing arrows',
      code: 'const load = async (): Promise<() => number> =>\n  await factory()',
      output: 'const load = async (): Promise<() => number> => { return (\n  await factory()); }',
      errors,
    },
    {
      name: 'preserves JSX returns',
      filename: 'test.tsx',
      code: 'const View = () => (\n  <div>\n    Hello\n  </div>\n)',
      output: 'const View = () => { return ( (\n  <div>\n    Hello\n  </div>\n)); }',
      errors,
    },
    {
      name: 'fixes nested concise arrows independently',
      code: 'const outer = () => (\n  () =>\n    value\n)',
      output: 'const outer = () => { return ( (\n  () => { return (\n    value); }\n)); }',
      errors: [errors[0]!, errors[0]!],
    },
  ],
})
