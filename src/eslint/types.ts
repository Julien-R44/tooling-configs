import type { Linter } from 'eslint'
import type { ParserOptions } from '@typescript-eslint/parser'
import type { FlatGitignoreOptions } from 'eslint-config-flat-gitignore'

export type FlatConfigItem = Omit<Linter.Config<Linter.RulesRecord>, 'plugins'> & {
  // Relax plugins type limitation, as most of the plugins did not have correct type info yet.
  /**
   * An object containing a name-value mapping of plugin names to plugin objects. When `files` is specified, these plugins are only available to the matching files.
   *
   * @see [Using plugins in your configuration](https://eslint.org/docs/latest/user-guide/configuring/configuration-files-new#using-plugins-in-your-configuration)
   */
  plugins?: Record<string, any>
}

export type UserConfigItem = FlatConfigItem | Linter.FlatConfig

export type Awaitable<T> = T | Promise<T>

export interface OptionsTypeScriptWithTypes {
  /**
   * When this options is provided, type aware rules will be enabled.
   * @see https://typescript-eslint.io/linting/typed-linting/
   */
  tsconfigPath?: string | string[]

  /**
   * Force the use of decorators. You should enable it when you use the "legacy" decorators of Typescript.
   * Particularly useful under AdonisJS: if this rule is not activated then when an import is used by an `@inject`,
   * typescript-eslint/consistent-type-imports would replace the import with a type import, which will break the
   * dependency injection.
   */
  forceDecorators?: boolean
}

export interface OptionsTypeScriptParserOptions {
  /**
   * Additional parser options for TypeScript.
   */
  parserOptions?: Partial<ParserOptions>
}

export type JulrOptions = {
  /**
   * If enabled, all files specified in `.gitignore` will be ignored
   * by eslint
   */
  enableGitIgnore?: boolean | FlatGitignoreOptions

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
  typescript?:
    | boolean
    | ((OptionsTypeScriptWithTypes | OptionsTypeScriptParserOptions) & { typeAwareRules?: boolean })

  /**
   * Enable UnoCSS lint rules
   *
   * Enabled by default is `unocss` is detected in dependencies
   */
  unocss?: boolean
}
