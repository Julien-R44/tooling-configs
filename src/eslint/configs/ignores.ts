import { GLOB_EXCLUDE } from '../globs.js'
import type { ConfigItem } from '../types.js'

export async function ignores(): Promise<ConfigItem[]> {
  return [{ ignores: GLOB_EXCLUDE }]
}
