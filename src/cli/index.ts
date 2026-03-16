#!/usr/bin/env node

import color from 'picocolors'
import { intro, log, confirm, multiselect, isCancel, cancel } from '@clack/prompts'

import { updateOxc } from './update_oxc.js'
import { updatePkgJson } from './update_pkg.json.js'
import { updateTsconfig } from './update_tsconfig.js'

function exit() {
  cancel('Cancelled')
  return process.exit(0)
}

export interface PromptResult {
  tools: ('tsconfig' | 'oxc')[]
}

async function main() {
  const cwd = process.cwd()

  intro(color.blue('@julr/tooling-configs'))

  log.info(
    `You are about to configure @julr/tooling-configs in the current directory: ${color.green(cwd)}`,
  )

  const shouldContinue = await confirm({ message: `Continue ?` })
  if (isCancel(shouldContinue)) return exit()

  const tools = await multiselect({
    message: 'Select tools to configure',
    options: [
      { value: 'tsconfig', label: 'TypeScript' },
      { value: 'oxc', label: 'OXC (oxlint + oxfmt)' },
    ],
    required: true,
  })
  if (isCancel(tools)) return exit()

  await updatePkgJson({ tools })
  await updateTsconfig({ tools })
  await updateOxc({ tools })

  log.success('All done. Make sure to install the dependencies with `pnpm install.')
}

main()
