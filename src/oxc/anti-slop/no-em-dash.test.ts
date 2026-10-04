import { describe, it } from 'node:test'
import { RuleTester } from 'oxlint/plugins-dev'

import { noEmDashRule } from './no-em-dash.ts'

RuleTester.describe = describe
RuleTester.it = it

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: 'ts' } } })

tester.run('no-em-dash', noEmDashRule, {
  valid: [
    'const note = "short, direct"',
    '// one -- two – three',
    String.raw`const note = "one \u2014 two"`,
    String.raw`const note = "one \u{2014} two"`,
    { code: 'const view = <p>one – two</p>', filename: 'test.tsx' },
  ],
  invalid: [
    {
      name: 'reports full source sentences in strings and comments',
      code: 'const note = "one — two"\n// three — four',
      output: null,
      errors: [
        { messageId: 'avoid', line: 1, column: 0, endLine: 1, endColumn: 24 },
        { messageId: 'avoid', line: 2, column: 0, endLine: 2, endColumn: 15 },
      ],
    },
    {
      name: 'deduplicates multiple em dashes in one sentence',
      code: '// One — two — three.',
      output: null,
      errors: [{ messageId: 'avoid', column: 0, endColumn: 21 }],
    },
    {
      name: 'keeps separate sentences on the same line',
      code: '// One — two. Three — four!',
      output: null,
      errors: [
        { messageId: 'avoid', column: 0, endColumn: 13 },
        { messageId: 'avoid', column: 14, endColumn: 27 },
      ],
    },
    {
      name: 'uses question marks as sentence boundaries too',
      code: '// Why? One — two? Three — four',
      output: null,
      errors: [
        { messageId: 'avoid', column: 8, endColumn: 18 },
        { messageId: 'avoid', column: 19, endColumn: 31 },
      ],
    },
    {
      name: 'trims surrounding whitespace and stops at newlines',
      code: '/*\n   one — two   \n   three — four\n*/',
      output: null,
      errors: [
        { messageId: 'avoid', line: 2, column: 3, endLine: 2, endColumn: 12 },
        { messageId: 'avoid', line: 3, column: 3, endLine: 3, endColumn: 15 },
      ],
    },
    {
      name: 'handles CRLF and UTF-16 columns',
      code: '// clean\r\n// 😀 — two\r\n',
      output: null,
      errors: [{ messageId: 'avoid', line: 2, column: 0, endLine: 2, endColumn: 11 }],
    },
    {
      name: 'includes template literals',
      code: 'const note = `one — two`',
      output: null,
      errors: [{ messageId: 'avoid' }],
    },
    {
      name: 'includes JSX text',
      code: 'const view = <p>one — two</p>',
      filename: 'test.tsx',
      output: null,
      errors: [{ messageId: 'avoid' }],
    },
    {
      name: 'handles an em dash at the end of the file',
      code: '// —',
      output: null,
      errors: [{ messageId: 'avoid', column: 0, endColumn: 4 }],
    },
    {
      name: 'handles an em dash at the start of a source sentence',
      code: '/*\n— text\n*/',
      output: null,
      errors: [{ messageId: 'avoid', line: 2, column: 0, endLine: 2, endColumn: 6 }],
    },
  ],
})
