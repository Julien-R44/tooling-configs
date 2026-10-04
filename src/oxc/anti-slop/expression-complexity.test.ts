import { describe, it } from 'node:test'
import { RuleTester } from 'oxlint/plugins-dev'

import { expressionComplexityRule } from './expression-complexity.ts'

RuleTester.describe = describe
RuleTester.it = it

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: 'ts' } } })

tester.run('expression-complexity', expressionComplexityRule, {
  valid: [
    'if (a && b && c && d) run()',
    'if (a || b || c || d) run()',
    'const value = a ?? b ?? c ?? d',
    'if (a && (b || c) && d) run()',
    'const value = a ? b : c ? d : e ? f : g',
    'if (a && call(b && c && d && e)) run()',
    'const value = a && new Service(b && c && d && e)',
    { code: 'if (a) run(); const value = a?.b; a &&= b', options: [{ max: 0 }] },
    { code: 'if (a && b) { if (c || d) run() }', options: [{ max: 1 }] },
    { code: 'const value = a && { first: b && c, second: d || e }', options: [{ max: 1 }] },
    { code: 'const value = a && (() => b && c)', options: [{ max: 1 }] },
    { code: 'const value = a && function () { return b && c }', options: [{ max: 1 }] },
    {
      code: 'const value = a && class { field = b && c; run() { return d || e } }',
      options: [{ max: 1 }],
    },
    {
      code: 'const value = a && <View prop={b && c}>{d || e}</View>',
      filename: 'test.tsx',
      options: [{ max: 1 }],
    },
    { code: 'const value = a && <>{b && c}</>', filename: 'test.tsx', options: [{ max: 1 }] },
    { code: 'const value = a && [b, c]', options: [{ max: 1 }] },
    { code: 'if (a && b && c) run()', options: [{ max: 2 }] },
    { code: 'if (a && b && c && d && e) run()', options: [{ max: 4 }] },
    { code: 'if (a && b && c && d) run()', options: [{}] },
  ],
  invalid: [
    {
      name: 'reports the entire expression once above the default limit',
      code: 'if (a && b && c && d && e) run()',
      errors: [
        { messageId: 'tooComplex', data: { count: 4, max: 3 }, line: 1, column: 4, endColumn: 25 },
      ],
      output: null,
    },
    {
      name: 'counts mixed operators across parentheses and TypeScript assertions',
      code: 'if (((a && b) as boolean) || (c && d) || e) run()',
      errors: [{ messageId: 'tooComplex', data: { count: 4, max: 3 } }],
      output: null,
    },
    {
      name: 'counts nullish operators',
      code: 'const value = a ?? b ?? c ?? d ?? e',
      errors: [{ messageId: 'tooComplex', data: { count: 4, max: 3 } }],
      output: null,
    },
    {
      name: 'counts ternaries and logical operators together',
      code: 'const value = (a && b) ? (c || d) : (e ?? f)',
      errors: [{ messageId: 'tooComplex', data: { count: 4, max: 3 } }],
      output: null,
    },
    {
      name: 'counts nested ternaries',
      code: 'const value = a ? b : c ? d : e ? f : g ? h : i',
      errors: [{ messageId: 'tooComplex', data: { count: 4, max: 3 } }],
      output: null,
    },
    {
      name: 'supports an explicit lower limit',
      code: 'if (a && b && c && d) run()',
      options: [{ max: 2 }],
      errors: [{ messageId: 'tooComplex', data: { count: 3, max: 2 } }],
      output: null,
    },
    {
      name: 'supports zero as a limit',
      code: 'if (a || b) run()',
      options: [{ max: 0 }],
      errors: [{ messageId: 'tooComplex', data: { count: 1, max: 0 } }],
      output: null,
    },
    {
      name: 'counts operators through unary and binary expressions',
      code: 'if (a && !((b && c) === (d || e))) run()',
      options: [{ max: 2 }],
      errors: [{ messageId: 'tooComplex', data: { count: 3, max: 2 } }],
      output: null,
    },
    {
      name: 'counts operators through arrays and computed property access',
      code: 'const value = a && [b && c, items[d || e]]',
      options: [{ max: 2 }],
      errors: [{ messageId: 'tooComplex', data: { count: 3, max: 2 } }],
      output: null,
    },
    {
      name: 'analyzes call arguments without combining them with the outer expression',
      code: 'if (a && call(b && c && d && e)) run()',
      options: [{ max: 2 }],
      errors: [{ messageId: 'tooComplex', data: { count: 3, max: 2 } }],
      output: null,
    },
    {
      name: 'nested arrow expressions are independent',
      code: 'const value = a && (() => b && c && d && e)',
      options: [{ max: 2 }],
      errors: [{ messageId: 'tooComplex', data: { count: 3, max: 2 } }],
      output: null,
    },
    {
      name: 'restores the outer count after nested boundaries',
      code: 'const value = a && b && call(() => ({ prop: c && d })) && e',
      options: [{ max: 2 }],
      errors: [{ messageId: 'tooComplex', data: { count: 3, max: 2 } }],
      output: null,
    },
    {
      name: 'reports separate expressions independently',
      code: 'if (a && b && c && d && e) run(); const value = f || g || h || i || j',
      errors: [
        { messageId: 'tooComplex', data: { count: 4, max: 3 } },
        { messageId: 'tooComplex', data: { count: 4, max: 3 } },
      ],
      output: null,
    },
    {
      name: 'reports nested and outer expressions independently',
      code: 'const value = a && b && call(c && d && e && f) && g',
      options: [{ max: 2 }],
      errors: [
        { messageId: 'tooComplex', data: { count: 3, max: 2 } },
        { messageId: 'tooComplex', data: { count: 3, max: 2 } },
      ],
      output: null,
    },
  ],
})
