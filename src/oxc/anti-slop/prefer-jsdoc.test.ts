// Cases adapted from antfu/eslint-plugin-slop (MIT). See LICENSE.
import { describe, it } from 'node:test'
import { RuleTester } from 'oxlint/plugins-dev'

import { preferJsdocRule } from './prefer-jsdoc.ts'

RuleTester.describe = describe
RuleTester.it = it

const tester = new RuleTester({ languageOptions: { parserOptions: { lang: 'ts' } } })
const errors = [{ messageId: 'preferJsdoc' }]

tester.run('prefer-jsdoc', preferJsdocRule, {
  valid: [
    'export const value = 1',
    '/** Description. */\nexport const value = 1',
    '/* Description. */\nexport const value = 1',
    '// File overview.\n\nexport const value = 1',
    '// Copyright 2026\nexport const value = 1',
    '// SPDX-License-Identifier: MIT\nexport const value = 1',
    '// Local implementation.\nfunction run() {}',
    '// Local bindings.\nconst { value } = source',
    'const object = {\n  // Not a declared member.\n  value: 1\n}',
    'const value = 1 // Trailing comment.\nexport const other = 2',
    '// Exports.\nexport { value }',
    '// Re-exports.\nexport * from "./other"',
    '/// <reference types="node" />\nexport const value = 1',
    ...[
      'eslint-disable-next-line no-unused-vars',
      '@ts-expect-error',
      '@ts-ignore',
      'globals foo',
      'prettier-ignore',
      'c8 ignore next',
      'istanbul ignore next',
      'biome-ignore lint: reason',
      'oxlint-disable-next-line',
    ].map(directive => `// ${directive}\nexport const value = 1`),
    '// Description.\n// @ts-expect-error\nexport const value = 1',
  ],
  invalid: [
    {
      name: 'converts a single comment directly to multiline JSDoc',
      code: '// Description.\nexport const value = 1',
      output: '/**\n * Description.\n */\nexport const value = 1',
      errors: [{ messageId: 'preferJsdoc', line: 1, endLine: 1 }],
    },
    {
      name: 'converts multiline runs, preserves empty lines, and closes a non-header gap',
      code: 'import "setup"\n// First.\n//\n// Last.\n\nexport function run() {}',
      output: 'import "setup"\n/**\n * First.\n *\n * Last.\n */\nexport function run() {}',
      errors: [{ messageId: 'preferJsdoc', line: 2, endLine: 4 }],
    },
    {
      name: 'converts only the final contiguous run',
      code: '// File overview.\n\n// Description.\nexport const value = 1',
      output: '// File overview.\n\n/**\n * Description.\n */\nexport const value = 1',
      errors,
    },
    {
      name: 'handles default exports',
      code: '// Default action.\nexport default function run() {}',
      output: '/**\n * Default action.\n */\nexport default function run() {}',
      errors,
    },
    {
      name: 'handles exported destructuring',
      code: '// Public bindings.\nexport const { value } = source',
      output: '/**\n * Public bindings.\n */\nexport const { value } = source',
      errors,
    },
    ...[
      ['class Action', 'value = 1'],
      ['class Action', 'run() {}'],
      ['abstract class Action', 'abstract value: string'],
      ['abstract class Action', 'abstract run(): void'],
      ['interface Action', 'value: string'],
      ['interface Action', 'run(): void'],
      ['interface Action', '[key: string]: string'],
      ['type Action =', 'value: string'],
      ['enum Action', 'Run'],
    ].map(([declaration, member]) => ({
      name: `documents ${declaration} members`,
      code: `${declaration} {\n  // Description.\n  ${member}\n}`,
      output: `${declaration} {\n  /**\n   * Description.\n   */\n  ${member}\n}`,
      errors,
    })),
    {
      name: 'preserves decorators',
      code: 'class Action {\n  // Description.\n  @decorator\n  run() {}\n}',
      output: 'class Action {\n  /**\n   * Description.\n   */\n  @decorator\n  run() {}\n}',
      errors,
    },
    {
      name: 'preserves CRLF',
      code: '// Description.\r\nexport const value = 1\r\n',
      output: '/**\r\n * Description.\r\n */\r\nexport const value = 1\r\n',
      errors,
    },
    {
      name: 'does not insert a closing delimiter into a block comment',
      code: '// Matches */ in source.\nexport const value = 1',
      output: null,
      errors,
    },
  ],
})
