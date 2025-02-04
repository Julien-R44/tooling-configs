import { GLOB_EXCLUDE } from '../globs.js'
import type { FlatConfigItem } from '../types.js'

export async function ignores(userIgnores: string[] = []): Promise<FlatConfigItem[]> {
  return [
    {
      name: 'julr:ignores',
      ignores: [...GLOB_EXCLUDE, ...userIgnores],
    },
  ]
}
