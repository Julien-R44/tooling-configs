import { join } from 'node:path'
import * as p from '@clack/prompts'
import { readFile, writeFile } from 'node:fs/promises'

import type { PromptResult } from './index.js'
import pkgJson from '../../package.json' with { type: 'json' }

export async function updatePkgJson(result: PromptResult) {
  if (!result.tools.includes('tsconfig')) return

  const cwd = process.cwd()
  const pathPackageJSON = join(cwd, 'package.json')
  const userPkgJson = JSON.parse(await readFile(pathPackageJSON, 'utf-8'))

  userPkgJson.devDependencies ??= {}
  userPkgJson.devDependencies['@julr/tooling-configs'] = `^${pkgJson.version}`

  await writeFile(pathPackageJSON, JSON.stringify(userPkgJson, null, 2))

  p.log.success('Package.json updated 🤠')
}
