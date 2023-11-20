import { isPackageExists } from 'local-pkg'

export const hasTypeScript = isPackageExists('typescript')
export const hasVue =
  isPackageExists('vue') || isPackageExists('nuxt') || isPackageExists('vitepress')

export const hasUnocss =
  isPackageExists('unocss') || isPackageExists('@unocss/webpack') || isPackageExists('@unocss/nuxt')
