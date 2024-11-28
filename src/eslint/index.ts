import { existsSync } from 'node:fs'

import { vue } from './configs/vue.js'
import { node } from './configs/node.js'
import { jsonc } from './configs/jsonc.js'
import { jsdoc } from './configs/jsdoc.js'
import { unocss } from './configs/unocss.js'
import { ignores } from './configs/ignores.js'
import { imports } from './configs/imports.js'
import { unicorn } from './configs/unicorn.js'
import { style } from './configs/stylistic.js'
import { prettier } from './configs/prettier.js'
import { adonisjs } from './configs/adonisjs.js'
import { combine, interopDefault } from './utils.js'
import { javascript } from './configs/javascript.js'
import { typescript } from './configs/typescript.js'
import { perfectionist } from './configs/perfectionist.js'
import { sortPackageJson, sortTsconfig } from './configs/sort.js'
import { hasAdonisjs, hasTypeScript, hasUnocss, hasVue } from './env.js'
import type { Awaitable, ConfigItem, JulrOptions, UserConfigItem } from './types.js'

export * from './configs/index.js'
export { combine, interopDefault } from './utils.js'

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
    adonisjs: enableAdonisJs = hasAdonisjs,
  } = options

  const configs: Awaitable<ConfigItem[]>[] = []

  if (enableGitIgnore) {
    const plugin = await interopDefault(import('eslint-config-flat-gitignore'))

    if (typeof enableGitIgnore !== 'boolean') {
      // @ts-expect-error - ignore
      configs.push(plugin(enableGitIgnore))
    } else if (existsSync('.gitignore')) {
      // @ts-expect-error - ignore
      configs.push(plugin())
    }
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
    style(),
  )

  if (enableTypescript) {
    configs.push(
      typescript({
        ...(typeof enableTypescript !== 'boolean' ? enableTypescript : {}),
        enableForVue: enableVue,
      }),
    )
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

  if (enableAdonisJs) {
    configs.push(adonisjs())
  }

  if (enablePrettier) {
    configs.push(prettier())
  }

  const resolved = await Promise.all(configs)
  return combine(...resolved, ...userConfigs)
}
