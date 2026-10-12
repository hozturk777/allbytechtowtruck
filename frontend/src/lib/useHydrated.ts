import { useSyncExternalStore } from 'react'

const noop = () => () => {}

/** Sunucuda ve hydration sırasında false, sonrasında true. */
export function useHydrated() {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  )
}
