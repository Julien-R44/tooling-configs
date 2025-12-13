import { join } from 'node:path'
import * as p from '@clack/prompts'
import { existsSync } from 'node:fs'
import { installPackage } from '@antfu/install-pkg'
import { mkdir, readFile, writeFile } from 'node:fs/promises'

import type { PromptResult } from './index.js'

const oxfmtConfig = {
  $schema: './node_modules/oxfmt/configuration_schema.json',
  experimentalSortImports: {
    order: 'desc',
  },
  trailingComma: 'all',
  semi: false,
  singleQuote: true,
  quoteProps: 'as-needed',
  bracketSpacing: true,
  arrowParens: 'always',
  printWidth: 100,
  ignorePatterns: ['.adonisjs/**', 'node_modules/**', 'dist/**', 'build/**'],
}

const oxlintConfig = {
  $schema: './node_modules/oxlint/configuration_schema.json',
  plugins: ['typescript', 'eslint', 'unicorn', 'import', 'promise'],
  rules: {
    'typescript/triple-slash-reference': 'off',
  },
}

const vscodeSettings = {
  'oxc.typeAware': true,
  'oxc.fmt.experimental': true,
  'editor.defaultFormatter': 'oxc.oxc-vscode',
}

const oxcScripts = {
  'format': 'oxfmt',
  'lint': 'oxlint',
  'lint:fix': 'oxlint --fix',
}

const oxcPackages = ['oxfmt', 'oxlint', 'oxlint-tsgolint']

export async function updateOxc(result: PromptResult) {
  if (!result.tools.includes('oxc')) return

  const cwd = process.cwd()

  await writeFile(join(cwd, '.oxfmtrc.json'), JSON.stringify(oxfmtConfig, null, 2))
  await writeFile(join(cwd, '.oxlintrc.json'), JSON.stringify(oxlintConfig, null, 2))

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
