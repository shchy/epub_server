export const iOSCanInstall =
  typeof window !== 'undefined' && 'standalone' in window.navigator
export const iOSIsInstalled =
  typeof window !== 'undefined' &&
  window.matchMedia('(display-mode: standalone)').matches
