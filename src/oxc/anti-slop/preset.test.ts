import { it } from 'node:test'
import { join } from 'node:path'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'

it('requires and fixes multiline JSDoc only when antiSlop is enabled', () => {
  const directory = mkdtempSync(join(process.cwd(), '.test-jsdoc-'))
  const config = join(directory, 'oxlint.config.ts')
  const fixture = join(directory, 'fixture.ts')
  const original = [
    '/** Description. */',
    '/** @type {number} */',
    '/** @lends Foo */',
    '/* Ordinary block. */',
    '// Ordinary line.',
    '/**',
    ' * Already multiline.',
    ' */',
    'export const documented = 0',
    '// Public value.',
    'export const value = 1',
    '',
  ].join('\n')
  const expected = [
    '/**',
    ' * Description.',
    ' */',
    '/**',
    ' * @type {number}',
    ' */',
    '/**',
    ' * @lends Foo',
    ' */',
    '/* Ordinary block. */',
    '// Ordinary line.',
    '/**',
    ' * Already multiline.',
    ' */',
    'export const documented = 0',
    '/**',
    ' * Public value.',
    ' */',
    'export const value = 1',
    '',
  ].join('\n')

  function lint(...args: string[]) {
    return spawnSync(
      process.execPath,
      [
        'node_modules/oxlint/bin/oxlint',
        '-c',
        config,
        '--threads=1',
        '--format=json',
        ...args,
        fixture,
      ],
      { encoding: 'utf8' },
    )
  }

  try {
    writeFileSync(fixture, original)
    for (const antiSlop of [false, true]) {
      writeFileSync(
        config,
        `import { julrPreset } from '@julr/tooling-configs/oxc/lint'
export default julrPreset({ antiSlop: ${antiSlop} })`,
      )
      const result = lint()
      assert.equal(result.status, antiSlop ? 1 : 0, result.stdout + result.stderr)
      const { diagnostics } = JSON.parse(result.stdout)
      assert.equal(diagnostics.length, antiSlop ? 4 : 0, result.stdout)
      for (const diagnostic of diagnostics) {
        assert.match(diagnostic.code, /multiline-blocks|prefer-jsdoc/u)
      }
    }

    const fixed = lint('--fix')
    assert.equal(fixed.status, 0, fixed.stdout + fixed.stderr)
    assert.equal(readFileSync(fixture, 'utf8'), expected)
    const clean = lint()
    assert.equal(clean.status, 0, clean.stdout + clean.stderr)
    assert.deepEqual(JSON.parse(clean.stdout).diagnostics, [])
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})

it('limits depth and complexity only when antiSlop is enabled', () => {
  const directory = mkdtempSync(join(process.cwd(), '.test-limits-'))
  const config = join(directory, 'oxlint.config.ts')
  const fixture = join(directory, 'fixture.ts')

  try {
    for (const antiSlop of [false, true]) {
      writeFileSync(
        config,
        `import { julrPreset } from '@julr/tooling-configs/oxc/lint'
export default julrPreset({ antiSlop: ${antiSlop} })`,
      )
      for (const [source, code, severity] of [
        ['if (n > 0) { if (n > 1) { if (n > 2) { return 3 } } }', '', ''],
        [
          'if (n > 0) { if (n > 1) { if (n > 2) { if (n > 3) { return 4 } } } }',
          'eslint(max-depth)',
          'error',
        ],
        [Array.from({ length: 9 }, (_, i) => `if (n === ${i}) return ${i}`).join('\n'), '', ''],
        [
          Array.from({ length: 10 }, (_, i) => `if (n === ${i}) return ${i}`).join('\n'),
          'eslint(complexity)',
          'warning',
        ],
        [Array.from({ length: 70 }, () => 'n += 1').join('\n'), '', ''],
      ]) {
        writeFileSync(fixture, `export function example(n: number) {\n${source}\nreturn n\n}`)
        const result = spawnSync(
          process.execPath,
          ['node_modules/oxlint/bin/oxlint', '-c', config, '--threads=1', '--format=json', fixture],
          { encoding: 'utf8' },
        )
        assert.equal(
          result.status,
          antiSlop && severity === 'error' ? 1 : 0,
          result.stdout + result.stderr,
        )
        const { diagnostics } = JSON.parse(result.stdout)
        assert.deepEqual(
          diagnostics.map(({ code, severity }: { code: string; severity: string }) => ({
            code,
            severity,
          })),
          antiSlop && code ? [{ code, severity }] : [],
          result.stdout,
        )
      }
    }
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})
