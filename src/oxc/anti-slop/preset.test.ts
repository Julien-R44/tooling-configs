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
    'export {}',
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
    'export {}',
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
      assert.equal(diagnostics.length, antiSlop ? 3 : 0, result.stdout)
      for (const diagnostic of diagnostics) {
        assert.match(diagnostic.code, /multiline-blocks/u)
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
