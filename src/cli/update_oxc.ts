import { join } from 'node:path'
import * as p from '@clack/prompts'
import { existsSync } from 'node:fs'
import { installPackage } from '@antfu/install-pkg'
import { mkdir, readFile, writeFile } from 'node:fs/promises'

import type { PromptResult } from './index.js'

const oxlintConfigContent = `import { defineConfig } from 'oxlint'
import { julrPreset } from '@julr/tooling-configs/oxc/lint'

export default defineConfig({
  extends: [julrPreset()],
})
`

const oxfmtConfigContent = `import { julrPreset } from '@julr/tooling-configs/oxc/fmt'

export default julrPreset()
`

const vscodeSettings = {
  'oxc.typeAware': true,
  'oxc.fmt.experimental': true,
  'editor.defaultFormatter': 'oxc.oxc-vscode',
}

const oxcScripts = {
  'format': 'oxfmt --write .',
  'lint': 'oxlint',
  'lint:fix': 'oxlint --fix',
}

const oxcPackages = ['oxfmt', 'oxlint', '@julr/tooling-configs']

export async function updateOxc(result: PromptResult) {
  if (!result.tools.includes('oxc')) return

  const cwd = process.cwd()

  await writeFile(join(cwd, 'oxlint.config.ts'), oxlintConfigContent)
  await writeFile(join(cwd, 'oxfmt.config.ts'), oxfmtConfigContent)

  await updateVscodeSettings(cwd)
  await addScriptsToPackageJson(cwd)
  await installPackage(oxcPackages, { dev: true, cwd })

  p.log.success('OXC configured (oxlint + oxfmt) 🦀')
}

async function updateVscodeSettings(cwd: string) {
  const vscodePath = join(cwd, '.vscode')
  const settingsPath = join(vscodePath, 'settings.json')

  if (!existsSync(vscodePath)) await mkdir(vscodePath)

  let settings: Record<string, unknown> = {}
  if (existsSync(settingsPath)) {
    const content = await readFile(settingsPath, 'utf-8')
    settings = JSON.parse(content)
  }

  for (const [key, value] of Object.entries(vscodeSettings)) {
    if (!(key in settings)) settings[key] = value
  }

  await writeFile(settingsPath, JSON.stringify(settings, null, 2))
}

async function addScriptsToPackageJson(cwd: string) {
  const pkgPath = join(cwd, 'package.json')
  const pkg = JSON.parse(await readFile(pkgPath, 'utf-8'))

  pkg.scripts ??= {}
  for (const [key, value] of Object.entries(oxcScripts)) pkg.scripts[key] = value

  await writeFile(pkgPath, JSON.stringify(pkg, null, 2))
}
