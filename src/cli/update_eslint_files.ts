import { join } from 'node:path'
import * as p from '@clack/prompts'
import { existsSync } from 'node:fs'
import { rm, writeFile } from 'node:fs/promises'

import type { PromptResult } from './index.js'

const eslintContent = `import { julr } from '@julr/tooling-configs/eslint'

export default await julr()
`

export async function updateEslintFiles(result: PromptResult) {
  if (!result.tools.includes('eslint')) return

  const cwd = process.cwd()
  const eslintIgnore = join(cwd, '.eslintignore')

  const eslintPath = join(cwd, 'eslint.config.js')

  if (existsSync(eslintIgnore)) {
    await rm(eslintIgnore).catch(() => {})
  }

  await writeFile(eslintPath, eslintContent)
  p.log.success('ESLint files updated 👻')
}
