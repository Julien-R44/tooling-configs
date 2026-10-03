import { it } from 'node:test'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'

const root = fileURLToPath(new URL('../../../', import.meta.url))
const oxlint = fileURLToPath(new URL('../bin/oxlint', import.meta.resolve('oxlint')))

it('loads the built plugin from a consumer project, fixes dependencies, and honors preset overrides', () => {
  const directory = mkdtempSync(join(tmpdir(), 'anti-slop-'))
  try {
    mkdirSync(join(directory, 'node_modules/@julr'), { recursive: true })
    symlinkSync(root, join(directory, 'node_modules/@julr/tooling-configs'), 'dir')
    symlinkSync(join(root, 'node_modules/oxlint'), join(directory, 'node_modules/oxlint'), 'dir')
    writeFileSync(join(directory, 'package.json'), '{"type":"module"}')

    const config = join(directory, 'oxlint.config.ts')
    const fixture = join(directory, 'service.ts')
    const code =
      '@inject() class Service { #dependency: Logger; constructor(logger: Logger) { this.#dependency = logger; } run() { return this.#dependency; } }'
    const output =
      '@inject() class Service {  constructor(protected logger: Logger) {  } run() { return this.logger; } }'
    const privateCode = '@inject() class PrivateService { constructor(private logger: Logger) {} }'
    writeFileSync(fixture, code)
    writeFileSync(join(directory, 'private.ts'), privateCode)

    const configure = (options: string, rules = '{}', standalone = false) => {
      writeFileSync(
        config,
        standalone
          ? `export default { categories: { correctness: 'off' }, jsPlugins: ['@julr/tooling-configs/oxc/anti-slop'], rules: ${rules} }`
          : `import { julrPreset } from '@julr/tooling-configs/oxc/lint'
export default { categories: { correctness: 'off' }, extends: [julrPreset(${options})], rules: ${rules} }`,
      )
    }
    const lint = (...args: string[]) => {
      const result = spawnSync(
        process.execPath,
        [
          oxlint,
          '-c',
          config,
          '--format',
          'json',
          '--threads',
          '1',
          ...args,
          'service.ts',
          'private.ts',
        ],
        {
          cwd: directory,
          encoding: 'utf8',
        },
      )
      assert.equal(result.error, undefined)
      assert.equal(result.signal, null, result.stderr)
      return result
    }

    configure('{}')
    const disabled = lint()
    assert.equal(disabled.status, 0, disabled.stdout + disabled.stderr)
    assert.equal(JSON.parse(disabled.stdout).diagnostics.length, 0)

    configure('{ antiSlop: true }')
    const enabled = lint()
    assert.equal(enabled.status, 1, enabled.stdout + enabled.stderr)
    const diagnostics = JSON.parse(enabled.stdout).diagnostics
    assert.equal(diagnostics.length, 1)
    assert.equal(diagnostics[0].code, 'anti-slop(prefer-constructor-injection)')
    assert.equal(diagnostics[0].severity, 'error')

    const fixed = lint('--fix')
    assert.equal(fixed.status, 0, fixed.stdout + fixed.stderr)
    assert.equal(readFileSync(fixture, 'utf8'), output)
    assert.equal(readFileSync(join(directory, 'private.ts'), 'utf8'), privateCode)
    assert.equal(JSON.parse(lint().stdout).diagnostics.length, 0)

    writeFileSync(fixture, code)
    configure('{ antiSlop: true }', "{ 'anti-slop/prefer-constructor-injection': 'off' }")
    const overridden = lint()
    assert.equal(overridden.status, 0, overridden.stdout + overridden.stderr)
    assert.equal(JSON.parse(overridden.stdout).diagnostics.length, 0)

    configure('{}', "{ 'anti-slop/prefer-constructor-injection': 'error' }", true)
    const standalone = lint()
    assert.equal(standalone.status, 1, standalone.stdout + standalone.stderr)
    assert.equal(JSON.parse(standalone.stdout).diagnostics.length, 1)
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
})
