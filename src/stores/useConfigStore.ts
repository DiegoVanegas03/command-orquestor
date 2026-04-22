import { create } from 'zustand'
import { load, Store } from '@tauri-apps/plugin-store'
import { WindowData } from '@/components/WindowSelectionModalContent'

export type Environment = 'production' | 'sandbox'

interface AppConfig {
  typingSpeed: number
  environment: Environment
  globalShortcuts: boolean
  attachedProcess: WindowData | null
}

interface ConfigStore extends AppConfig {
  changeConfig: (config: Partial<AppConfig>) => void
  loadConfig: () => Promise<void>
  saveToRust: () => Promise<void>
}

// Inicialización diferida del store de Rust
let rustStore: Store | null = null

const initStore = async () => {
  if (!rustStore) {
    rustStore = await load('settings.json')
  }
  return rustStore
}

export const useConfigStore = create<ConfigStore>((set, get) => ({
  typingSpeed: 50,
  environment: 'production',
  globalShortcuts: false,
  attachedProcess: null,

  changeConfig: (config) => set((state) => ({ ...state, ...config })),

  loadConfig: async () => {
    try {
      const store = await initStore()

      const typingSpeed = await store.get<number>('typingSpeed')
      const environment = await store.get<Environment>('environment')
      const globalShortcuts = await store.get<boolean>('globalShortcuts')

      set((state) => ({
        typingSpeed:
          typingSpeed !== null && typingSpeed !== undefined ? typingSpeed : state.typingSpeed,
        environment:
          environment !== null && environment !== undefined ? environment : state.environment,
        globalShortcuts:
          globalShortcuts !== null && globalShortcuts !== undefined
            ? globalShortcuts
            : state.globalShortcuts,
      }))
    } catch (e) {
      console.error('Failed to load config from Rust store:', e)
    }
  },

  saveToRust: async () => {
    try {
      const state = get()
      const store = await initStore()
      await store.set('typingSpeed', state.typingSpeed)
      await store.set('environment', state.environment)
      await store.set('globalShortcuts', state.globalShortcuts)
      await store.save()
    } catch (e) {
      console.error('Failed to save config to Rust store:', e)
    }
  },
}))
