import { vue } from './configs/vue.js'
import { node } from './configs/node.js'
import { jsonc } from './configs/jsonc.js'
import { jsdoc } from './configs/jsdoc.js'
import { unocss } from './configs/unocss.js'
import { ignores } from './configs/ignores.js'
import { imports } from './configs/imports.js'
import { unicorn } from './configs/unicorn.js'
import { prettier } from './configs/prettier.js'
import { combine, interopDefault } from './utils.js'
import { javascript } from './configs/javascript.js'
import { typescript } from './configs/typescript.js'
import { perfectionist } from './configs/perfectionist.js'
import { hasTypeScript, hasUnocss, hasVue } from './env.js'
import { sortPackageJson, sortTsconfig } from './configs/sort.js'
import type { Awaitable, ConfigItem, JulrOptions, UserConfigItem } from './types.js'

export async function julr(
  options: JulrOptions = {},
  ...userConfigs: Awaitable<UserConfigItem | UserConfigItem[]>[]
) {
  const {
    enableGitIgnore = true,
    typescript: enableTypescript = hasTypeScript,
    vue: enableVue = hasVue,
    jsonc: enableJsonc = true,
    prettier: enablePrettier = true,
    unocss: enableUno = hasUnocss,
  } = options

  const configs: Awaitable<ConfigItem[]>[] = []

  if (enableGitIgnore) {
    const plugin = await interopDefault(import('eslint-config-flat-gitignore'))
    // @ts-expect-error - ignore
    configs.push(plugin())
  }

  configs.push(
    ignores(),
    javascript(),
    perfectionist(),
    imports(),
    jsdoc(),
    unicorn(),
    node(),
    unicorn(),
  )

  if (enableTypescript) {
    configs.push(typescript())
  }

  if (enableVue) {
    configs.push(vue())
  }

  if (enableUno) {
    configs.push(unocss())
  }

  if (enableJsonc) {
    configs.push(jsonc(), sortPackageJson(), sortTsconfig())
  }

  if (enablePrettier) {
    configs.push(prettier())
  }

  const resolved = await Promise.all(configs)
  return combine(...resolved, ...userConfigs)
}
