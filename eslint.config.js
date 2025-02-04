import { julr } from './dist/eslint/index.js'

export default julr({
  vue: true,
  typescript: {
    typeAwareRules: false,
  },
})
