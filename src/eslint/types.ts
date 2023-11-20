import type { Linter } from 'eslint'
import type { FlatESLintConfigItem } from '@antfu/eslint-define-config'

export type ConfigItem = FlatESLintConfigItem & {
  name?: string
}

export type UserConfigItem = ConfigItem | Linter.FlatConfig

export type Awaitable<T> = T | Promise<T>

export type JulrOptions = {
  /**
   * If enabled, all files specified in `.gitignore` will be ignored
   * by eslint
   */
  enableGitIgnore?: boolean

  /**
   * Enable AdonisJS lint rules
   *
   * Enabled by default is Adonisjs is detected in dependencies
   */
  adonisjs?: boolean

  /**
   * Enable JSONC lint rules
   * @default true
   */
  jsonc?: boolean

  /**
   * Enable Prettier lint rules
   *
   * @default true
   */
  prettier?: boolean

  /**
   * Enable Vue lint rules
   *
   * Enabled by default if `vue` is detected in dependencies
   */
  vue?: boolean

  /**
   * Enable Typescript lint rules
   *
   * Enabled by default if `typescript` is detected in dependencies
   */
  typescript?: boolean

  /**
   * Enable UnoCSS lint rules
   *
   * Enabled by default is `unocss` is detected in dependencies
   */
  unocss?: boolean
}
