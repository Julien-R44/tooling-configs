import type { FlatESLintConfigItem } from '@antfu/eslint-define-config'

export type ConfigItem = FlatESLintConfigItem & {
  name?: string
}

export type Awaitable<T> = T | Promise<T>

export type JulrOptions = {
  enableGitIgnore?: boolean
  jsonc?: boolean
  prettier?: boolean
  vue?: boolean
  typescript?: boolean
}
