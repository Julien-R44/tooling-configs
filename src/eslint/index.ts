import { existsSync } from 'node:fs'
import { FlatConfigComposer } from 'eslint-flat-config-utils'

import { vue } from './configs/vue.js'
import { node } from './configs/node.js'
import { jsonc } from './configs/jsonc.js'
import { jsdoc } from './configs/jsdoc.js'
import { interopDefault } from './utils.js'
import { unocss } from './configs/unocss.js'
import { ignores } from './configs/ignores.js'
import { imports } from './configs/imports.js'
import { unicorn } from './configs/unicorn.js'
import { style } from './configs/stylistic.js'
import { prettier } from './configs/prettier.js'
import { adonisjs } from './configs/adonisjs.js'
import { javascript } from './configs/javascript.js'
import { typescript } from './configs/typescript.js'
import { perfectionist } from './configs/perfectionist.js'
import { sortPackageJson, sortTsconfig } from './configs/sort.js'
import { hasAdonisjs, hasTypeScript, hasUnocss, hasVue } from './env.js'
import type { Awaitable, FlatConfigItem, JulrOptions, UserConfigItem } from './types.js'

export * from './configs/index.js'

const flatConfigProps = [
  'name',
  'languageOptions',
  'linterOptions',
  'processor',
  'plugins',
  'rules',
  'settings',
] satisfies (keyof FlatConfigItem)[]

export function julr(
  options: JulrOptions & Omit<FlatConfigItem, 'files'> = {},
  ...userConfigs: Awaitable<UserConfigItem | UserConfigItem[]>[]
): FlatConfigComposer<FlatConfigItem> {
  const {
    enableGitIgnore = true,
    typescript: enableTypescript = hasTypeScript,
    vue: enableVue = hasVue,
    jsonc: enableJsonc = true,
    prettier: enablePrettier = true,
    unocss: enableUno = hasUnocss,
    adonisjs: enableAdonisJs = hasAdonisjs,
  } = options

  const configs: Awaitable<FlatConfigItem[]>[] = []

  if (enableGitIgnore) {
    if (typeof enableGitIgnore !== 'boolean') {
      configs.push(
        interopDefault(import('eslint-config-flat-gitignore')).then((r) => [
          r({ name: 'julr:gitignore', ...enableGitIgnore }),
        ]),
      )
    } else if (existsSync('.gitignore')) {
      configs.push(
        interopDefault(import('eslint-config-flat-gitignore')).then((r) => [
          r({ name: 'julr:gitignore', strict: false }),
        ]),
      )
    }
  }

  configs.push(
    ignores(options.ignores),
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

  // User can optionally pass a flat config item to the first argument
  // We pick the known keys as ESLint would do schema validation
  const fusedConfig = flatConfigProps.reduce((acc, key) => {
    if (key in options) acc[key] = options[key] as any
    return acc
  }, {} as FlatConfigItem)

  if (Object.keys(fusedConfig).length) configs.push([fusedConfig])

  const composer = new FlatConfigComposer()
  return composer.append(...configs, ...userConfigs)
}
