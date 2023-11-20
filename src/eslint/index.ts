import { vue } from './configs/vue.js'
import { jsonc } from './configs/jsonc.js'
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
  const configs: Awaitable<ConfigItem[]>[] = []

  configs.push(ignores(), javascript(), perfectionist(), imports())

  if (hasTypeScript || options.typescript) {
    configs.push(typescript())
  }

  if (hasVue || options.vue) {
    configs.push(vue())
  }

  if (options.jsonc ?? true) {
    configs.push(jsonc(), sortPackageJson(), sortTsconfig())
  }

  if (options.prettier ?? true) {
    configs.push(prettier())
  }

  const resolved = await Promise.all(configs)
  return resolved.flat()
}
