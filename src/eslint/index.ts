import { vue } from './configs/vue.js'
import { jsonc } from './configs/jsonc.js'
import { jsdoc } from './configs/jsdoc.js'
import { interopDefault } from './utils.js'
import { ignores } from './configs/ignores.js'
import { imports } from './configs/imports.js'
import { hasTypeScript, hasVue } from './env.js'
import { prettier } from './configs/prettier.js'
import { javascript } from './configs/javascript.js'
import { typescript } from './configs/typescript.js'
import { perfectionist } from './configs/perfectionist.js'
import { sortPackageJson, sortTsconfig } from './configs/sort.js'
import type { Awaitable, ConfigItem, JulrOptions } from './types.js'

export async function julr(options: JulrOptions = {}) {
  const {
    enableGitIgnore = true,
    typescript: enableTypescript = hasTypeScript,
    vue: enableVue = hasVue,
    jsonc: enableJsonc = true,
    prettier: enablePrettier = true,
  } = options

  const configs: Awaitable<ConfigItem[]>[] = []

  if (enableGitIgnore) {
    const plugin = await interopDefault(import('eslint-config-flat-gitignore'))
    // @ts-expect-error - ignore
    configs.push(plugin())
  }

  configs.push(ignores(), javascript(), perfectionist(), imports(), jsdoc())

  if (enableTypescript) {
    configs.push(typescript())
  }

  if (enableVue) {
    configs.push(vue())
  }

  if (enableJsonc) {
    configs.push(jsonc(), sortPackageJson(), sortTsconfig())
  }

  if (enablePrettier) {
    configs.push(prettier())
  }

  const resolved = await Promise.all(configs)
  return resolved.flat()
}
