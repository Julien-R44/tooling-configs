import { join } from 'node:path'
import * as p from '@clack/prompts'
import { writeFile } from 'node:fs/promises'

import type { PromptResult } from './index.js'

const tsConfigContent = `
{
  "extends": "@julr/tooling-configs/tsconfigs/tsconfig.node",
  "compilerOptions": {
    "rootDir": "./",
    "outDir": "./build"
  }
}
`

export async function updateTsconfig(result: PromptResult) {
  if (!result.tools.includes('tsconfig')) return

  const cwd = process.cwd()
  const tsconfigPath = join(cwd, 'tsconfig.json')

  await writeFile(tsconfigPath, tsConfigContent)
  p.log.success('Typescript configured 👹')
}
