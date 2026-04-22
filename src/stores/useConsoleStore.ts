import { create } from 'zustand'

export type ConsoleLogLevel = 'sys' | 'exec' | 'ok' | 'warn' | 'error' | 'info' | 'clear'

export interface ConsoleEntry {
  id: string
  level: ConsoleLogLevel
  message: string
  timestamp: Date
}

interface ConsoleStore {
  entries: ConsoleEntry[]
  log: (level: ConsoleLogLevel, message: string) => void
  clear: () => void
}

const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

export const useConsoleStore = create<ConsoleStore>((set, get) => ({
  entries: [],

  log: (level, message) => {
    const entry: ConsoleEntry = {
      id: makeId(),
      level,
      message,
      timestamp: new Date(),
    }
    set((state) => ({ entries: [...state.entries, entry] }))
  },

  clear: () => {
    const { log } = get()
    set({ entries: [] })
    log('clear', 'Consola limpiada por el usuario.')
  },
}))
