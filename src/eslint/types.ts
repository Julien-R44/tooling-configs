import type { FlatESLintConfigItem } from '@antfu/eslint-define-config'

export type ConfigItem = FlatESLintConfigItem & {
  name?: string
}

export type Awaitable<T> = T | Promise<T>

export type JulrOptions = {
  jsonc?: boolean
  prettier?: boolean
  vue?: boolean
  typescript?: boolean
}
