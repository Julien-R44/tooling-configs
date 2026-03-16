import { defineConfig } from 'oxlint'

import { julrPreset } from './src/oxc/lint.ts'

export default defineConfig({
  extends: [julrPreset({ perfectionist: true })],
})
