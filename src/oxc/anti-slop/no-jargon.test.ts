import { describe, it } from 'node:test'
import { RuleTester } from 'oxlint/plugins-dev'

import { noJargonRule } from './no-jargon.ts'

RuleTester.describe = describe
RuleTester.it = it

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: 'ts' } } })

tester.run('no-jargon', noJargonRule, {
  valid: [
    '// use the cache',
    'const robust = "utilize"; const note = `streamline`',
    '// robustness and unutilized values',
    '// the word `utilize` and "robust" are fine',
    '/* "utilize robust" and `streamline` */',
    { code: '// utilizes the ROBUST cache', options: [{ allow: ['UTILIZE', 'robust'] }] },
    { code: '/** utilize this */', options: [{ ignoreJSDoc: true }] },
    { code: '// utilize robust', options: [{ words: [] }] },
    { code: '// utilize robust', options: [{ words: ['bespoke'] }] },
    { code: '// bespoke', options: [{ words: ['bespoke'], allow: ['BESPOKE'] }] },
    { code: '// blazingly fast', options: [{ extraWords: ['blazingly'], allow: ['blazingly'] }] },
    { code: '// axb', options: [{ words: ['a.b'] }] },
  ],
  invalid: [
    {
      name: 'reports each word at its exact location and offers only known replacements',
      code: '// utilize the robust cache to streamline lookups',
      output: null,
      errors: [
        {
          messageId: 'jargon',
          data: { word: 'utilize' },
          line: 1,
          column: 3,
          endColumn: 10,
          suggestions: [
            {
              messageId: 'replace',
              data: { word: 'utilize', replacement: 'use' },
              output: '// use the robust cache to streamline lookups',
            },
          ],
        },
        {
          messageId: 'jargon',
          data: { word: 'robust' },
          line: 1,
          column: 15,
          endColumn: 21,
          suggestions: [],
        },
        {
          messageId: 'jargon',
          data: { word: 'streamline' },
          line: 1,
          column: 31,
          endColumn: 41,
          suggestions: [
            {
              messageId: 'replace',
              data: { word: 'streamline', replacement: 'simplify' },
              output: '// utilize the robust cache to simplify lookups',
            },
          ],
        },
      ],
    },
    {
      name: 'matches case-insensitively and replaces only the reported word',
      code: '// `leverage` LEVERAGE',
      output: null,
      errors: [
        {
          messageId: 'jargon',
          data: { word: 'LEVERAGE' },
          column: 14,
          endColumn: 22,
          suggestions: [
            {
              messageId: 'replace',
              data: { word: 'LEVERAGE', replacement: 'use' },
              output: '// `leverage` use',
            },
          ],
        },
      ],
    },
    {
      name: 'covers suffixes, dropped e, ies and ally inflections',
      code: '// Utilizes delving synergies holistically',
      output: null,
      errors: ['Utilizes', 'delving', 'synergies', 'holistically'].map(word => ({
        messageId: 'jargon',
        data: { word },
        suggestions: [],
      })),
    },
    {
      name: 'reports outside quotes after quoted jargon',
      code: '// "robust" `robust` robust',
      output: null,
      errors: [{ messageId: 'jargon', data: { word: 'robust' }, column: 21, suggestions: [] }],
    },
    {
      name: 'does not treat single quotes as an exclusion',
      code: "// 'robust'",
      output: null,
      errors: [{ messageId: 'jargon', data: { word: 'robust' }, column: 4, suggestions: [] }],
    },
    {
      name: 'includes JSDoc by default',
      code: '/** robust cache */',
      output: null,
      errors: [{ messageId: 'jargon', data: { word: 'robust' }, column: 4, suggestions: [] }],
    },
    {
      name: 'ignores only JSDoc when requested, not ordinary block comments',
      code: '/** robust cache */\n/* robust cache */',
      options: [{ ignoreJSDoc: true }],
      output: null,
      errors: [
        { messageId: 'jargon', data: { word: 'robust' }, line: 2, column: 3, suggestions: [] },
      ],
    },
    {
      name: 'restarts matching and quote tracking for each comment',
      code: '// robust "\n// robust',
      output: null,
      errors: [
        { messageId: 'jargon', data: { word: 'robust' }, line: 1, column: 3, suggestions: [] },
        { messageId: 'jargon', data: { word: 'robust' }, line: 2, column: 3, suggestions: [] },
      ],
    },
    {
      name: 'tracks multiline block comments, CRLF and UTF-16 columns',
      code: '/* note\r\n * 😀 robust\r\n */',
      output: null,
      errors: [
        {
          messageId: 'jargon',
          data: { word: 'robust' },
          line: 2,
          column: 6,
          endColumn: 12,
          suggestions: [],
        },
      ],
    },
    {
      name: 'adds custom words without disabling defaults',
      code: '// blazingly robust',
      options: [{ extraWords: ['blazingly'] }],
      output: null,
      errors: [
        { messageId: 'jargon', data: { word: 'blazingly' }, suggestions: [] },
        { messageId: 'jargon', data: { word: 'robust' }, suggestions: [] },
      ],
    },
    {
      name: 'replaces the defaults and combines additions and exclusions',
      code: '// utilize bespoke tailored',
      options: [{ words: ['bespoke'], extraWords: ['tailored'], allow: ['BESPOKE'] }],
      output: null,
      errors: [{ messageId: 'jargon', data: { word: 'tailored' }, suggestions: [] }],
    },
    {
      name: 'an empty replacement list can still have additions',
      code: '// robust bespoke',
      options: [{ words: [], extraWords: ['bespoke'] }],
      output: null,
      errors: [{ messageId: 'jargon', data: { word: 'bespoke' }, suggestions: [] }],
    },
    {
      name: 'custom words do not inherit replacement suggestions from Object.prototype',
      code: '// constructor __proto__',
      options: [{ words: ['constructor', '__proto__'] }],
      output: null,
      errors: [
        { messageId: 'jargon', data: { word: 'constructor' }, suggestions: [] },
        { messageId: 'jargon', data: { word: '__proto__' }, suggestions: [] },
      ],
    },
    {
      name: 'escapes regex metacharacters in custom words',
      code: '// axb a.b',
      options: [{ words: ['a.b'] }],
      output: null,
      errors: [
        { messageId: 'jargon', data: { word: 'a.b' }, column: 7, endColumn: 10, suggestions: [] },
      ],
    },
  ],
})
