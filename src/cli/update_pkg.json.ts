import { join } from 'node:path'
import * as p from '@clack/prompts'
import { readFile, writeFile } from 'node:fs/promises'

import type { PromptResult } from './index.js'
import pkgJson from '../../package.json' assert { type: 'json' }

export async function updatePkgJson(result: PromptResult) {
  const cwd = process.cwd()

  const pathPackageJSON = join(cwd, 'package.json')
  const userPkgJson = JSON.parse(await readFile(pathPackageJSON, 'utf-8'))

  userPkgJson.devDependencies ??= {}
  userPkgJson.devDependencies['@julr/tooling-configs'] = `^${pkgJson.version}`

  if (result.tools.includes('eslint')) {
    userPkgJson.devDependencies['eslint'] = pkgJson.devDependencies.eslint
    delete userPkgJson.eslintConfig
  }

  if (result.tools.includes('prettier')) {
    userPkgJson.devDependencies['prettier'] = pkgJson.devDependencies.prettier
    userPkgJson.prettier = '@julr/tooling-configs/prettier'
  }

  await writeFile(pathPackageJSON, JSON.stringify(userPkgJson, null, 2))

  p.log.success('Package.json updated 🤠')
}
