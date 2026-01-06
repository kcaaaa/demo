import { create } from 'zustand'

export type ThemeMode = 'light' | 'dark'

type UIState = {
  theme: ThemeMode
  collapsed: boolean
  setTheme: (mode: ThemeMode) => void
  toggleCollapse: () => void
}

const STORAGE_KEY = 'hs-ui'

const useUIStore = create<UIState>((set) => ({
  theme: (localStorage.getItem(STORAGE_KEY)?.includes('"dark"') && 'dark') || 'light',
  collapsed: false,
  setTheme: (mode) => {
    set({ theme: mode })
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ theme: mode }))
  },
  toggleCollapse: () =>
    set((state) => {
      const next = !state.collapsed
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ theme: state.theme, collapsed: next }))
      return { collapsed: next }
    }),
}))

export default useUIStore

