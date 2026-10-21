// Cases adapted from eslint-plugin-unicorn v76.0.0 (MIT). See LICENSE.
import { describe, it } from 'node:test'
import { RuleTester } from 'oxlint/plugins-dev'

import { preferEarlyReturnRule } from './prefer-early-return.ts'

RuleTester.describe = describe
RuleTester.it = it

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: 'ts' } } })
const errors = [{ messageId: 'prefer-early-return' }]
const shortErrors = [{ messageId: 'prefer-early-return/short-body' }]
const original = 'function run() {\n  if (ready) {\n    first();\n    second();\n  }\n}'
const fixed = 'function run() {\n  if (!ready) {\n    return;\n  }\n\n  first();\n  second();\n}'

tester.run('prefer-early-return', preferEarlyReturnRule, {
  valid: [
    'function run() { if (ready) work(); }',
    'function run() { if (ready) { work(); } }',
    'function run() { if (ready) { ; work(); ; } }',
    'function run() { if (ready) { first(); second(); } finish(); }',
    'function run() { if (ready) { first(); second(); } else { fallback(); } }',
    'function run() { while (ready) { if (ready) { first(); second(); } } }',
    'if (ready) { first(); second(); }',
    'const run = () => ready ? first() : second()',
    'declare function run(): void',
    { code: original, options: [{ maximumStatements: 2 }] },
    { code: 'function run() { if (ready) { ; } }', options: [{ maximumStatements: 0 }] },
    { code: 'function run() { if (ready); }', options: [{ maximumStatements: 0 }] },
    'function run() { if (!ready) return; work(); }',
    {
      code: 'function run() { if (!ready) return; work(); }',
      options: [{ maximumStatements: 0, checkShortBodies: true }],
    },
    {
      code: 'function run() { if (!ready) return null; work(); }',
      options: [{ checkShortBodies: true }],
    },
    {
      code: 'function run() { before(); if (!ready) return; work(); }',
      options: [{ checkShortBodies: true }],
    },
    {
      code: 'function run() { if (!ready) return; first(); second(); }',
      options: [{ checkShortBodies: true }],
    },
  ],
  invalid: [
    { code: original, output: fixed, errors },
    ...[
      'const run = function()',
      'const run = () =>',
      'async function run()',
      'function* run()',
    ].map(declaration => ({
      code: original.replace('function run()', declaration),
      output: fixed.replace('function run()', declaration),
      errors,
    })),
    {
      name: 'also checks methods',
      code: 'class Action { run() { if (ready) { first(); second(); } } }',
      output: 'class Action { run() { if (!ready) {\n\treturn;\n}\n\nfirst(); second(); } }',
      errors,
    },
    {
      name: 'checks the final if even after other statements',
      code: 'function run() { before(); if (ready) { first(); second(); } }',
      output: 'function run() { before(); if (!ready) {\n\treturn;\n}\n\nfirst(); second(); }',
      errors,
    },
    {
      name: 'maximumStatements zero includes unbraced single statements',
      code: 'function run() { if (ready) work(); }',
      output: 'function run() { if (!ready) {\n\treturn;\n}\n\nwork(); }',
      options: [{ maximumStatements: 0 }],
      errors,
    },
    ...[
      ['!ready', 'ready'],
      ['!(a || b)', '(a || b)'],
      ['! /* keep */ ready', '/* keep */ ready'],
      ['a || b', '!(a || b)'],
      ['a === b', '!(a === b)'],
      ['ready as boolean', '!(ready as boolean)'],
      ['ready satisfies boolean', '!(ready satisfies boolean)'],
      ['ready!', '!(ready!)'],
      ['<boolean>ready', '!(<boolean>ready)'],
      ['ready++', '!(ready++)'],
      ['ready /* keep */', '!(ready /* keep */)'],
    ].map(([condition, negated]) => ({
      name: `negates ${condition} without changing precedence or losing comments`,
      code: original.replace('(ready)', `(${condition})`),
      output: fixed.replace('(!ready)', `(${negated})`),
      errors,
    })),
    {
      name: 'preserves body comments and blank lines',
      code: original.replace('    first();', '    // keep\n    first();\n'),
      output: fixed.replace('  first();', '  // keep\n  first();\n'),
      errors,
    },
    {
      name: 'preserves a trailing line comment in the condition',
      code: original.replace('(ready)', '(ready // keep\n  )'),
      output: fixed.replace('(!ready)', '(!(ready // keep\n  ))'),
      errors,
    },
    ...['\t', '    '].map(indent => ({
      name: `preserves ${JSON.stringify(indent)} indentation`,
      code: original.replaceAll('  ', indent),
      output: fixed.replaceAll('  ', indent),
      errors,
    })),
    {
      name: 'preserves CRLF',
      code: original.replaceAll('\n', '\r\n'),
      output: fixed.replaceAll('\n', '\r\n'),
      errors,
    },
    {
      name: 'moves safe lexical declarations, including destructuring',
      code: 'function run() { if (ready) { const { value } = load(); use(value); } }',
      output:
        'function run() { if (!ready) {\n\treturn;\n}\n\nconst { value } = load(); use(value); }',
      errors,
    },
    {
      name: 'does not confuse a condition-local binding with the moved binding',
      code: 'function run() { if (items.some(value => value.ready)) { const value = load(); use(value); } }',
      output:
        'function run() { if (!items.some(value => value.ready)) {\n\treturn;\n}\n\nconst value = load(); use(value); }',
      errors,
    },
    ...[
      'function run() { if (value) { const value = load(); use(value); } }',
      'function run() { if (check(() => value)) { const value = load(); use(value); } }',
      'function run(value) { if (ready) { const value = load(); use(value); } }',
      'function run({ value }) { if (ready) { const value = load(); use(value); } }',
      'function run() { before(); if (ready) { const value = load(); use(value); } }',
      'function run() { if (eval("ready")) { const value = load(); use(value); } }',
      'function run() { if (ready) { function value() {} use(value); } }',
      'function run() { if (ready) { class Value {} use(Value); } }',
      'function run() { if (ready) { type Value = string; use<Value>(); } }',
      'function run() { if (ready) { interface Value {} use<Value>(); } }',
      'function run() { if (ready) { enum Value { A } use(Value); } }',
      'function run() { if (ready) { using value = load(); use(value); } }',
      'async function run() { if (ready) { await using value = load(); use(value); } }',
      'function run() { if (ready) { use(`first\n  second`); finish(); } }',
      'function run() { if (ready) /* keep */ { first(); second(); } }',
    ].map(code => ({ name: `reports without rewriting: ${code}`, code, output: null, errors })),
    {
      name: 'does not reindent multiline JSX text',
      filename: 'test.tsx',
      code: 'function View() { if (ready) { const element = <div>\n  text\n</div>; return element; } }',
      output: null,
      errors,
    },
    {
      name: 'does not rewrite multiline unbraced statements',
      code: 'function run() { if (ready) first(\n  value\n); }',
      options: [{ maximumStatements: 0 }],
      output: null,
      errors,
    },
    {
      name: 'offers only a suggestion when the wrapper has a trailing comment',
      code: original.replace('  }\n}', '  } // keep\n}'),
      output: null,
      errors: [
        {
          messageId: 'prefer-early-return',
          suggestions: [
            {
              messageId: 'prefer-early-return/suggestion',
              output: fixed.replace('  second();\n}', '  second(); // keep\n}'),
            },
          ],
        },
      ],
    },
    {
      name: 'optionally wraps short bodies, with the default threshold',
      code: 'function run() { if (!ready) return; work(); }',
      output: 'function run() { if (ready) {\n\twork();\n} }',
      options: [{ checkShortBodies: true }],
      errors: shortErrors,
    },
    {
      name: 'preserves an existing else block scope',
      code: 'function run() { if (!ready) return; else { const value = load(); } }',
      output: 'function run() { if (ready) { const value = load(); } }',
      options: [{ checkShortBodies: true }],
      errors: shortErrors,
    },
    ...[
      'function run() { if (!ready) return; const value = load(); }',
      'function run() { if (!ready) return; /* keep */ work(); }',
      'function run() { if (!ready) return; work(`first\n  second`); }',
    ].map(code => ({
      code,
      output: null,
      options: [{ checkShortBodies: true }],
      errors: shortErrors,
    })),
  ],
})
