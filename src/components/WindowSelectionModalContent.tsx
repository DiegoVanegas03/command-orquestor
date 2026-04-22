import { useState, useEffect } from 'react'
import { useModalStore } from '@/stores/useModalStore'
import { useConfigStore } from '@/stores/useConfigStore'
import { invoke } from '@tauri-apps/api/core'

const BROWSER_ICONS = ['chrome', 'firefox', 'edge', 'safari', 'browser', 'brave']

const TERMINAL_ICONS = ['terminal', 'bash', 'cmd', 'powershell', 'wezterm', 'warp']

const EDITORS_ICONS = [
  'code',
  'sublime',
  'atom',
  'antigravity',
  'kitty',
  'iterm2',
  'ghostty',
  'hyper',
  'vscode',
]

export interface WindowData {
  id: number
  title: string
  app_name: string
}

export const WindowSelectionModalContent = () => {
  const { closeModal, setHeaderAction } = useModalStore()
  const { changeConfig } = useConfigStore()

  const [selectedProcess, setSelectedProcess] = useState<WindowData | null>(null)
  const [processes, setProcesses] = useState<WindowData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterByAppName, setFilterByAppName] = useState('')
  const [filteredProcesses, setFilteredProcesses] = useState<WindowData[]>([])

  const fetchWindows = async () => {
    setIsLoading(true)
    try {
      const windows = await invoke<WindowData[]>('get_open_windows')
      setProcesses(windows)
    } catch (error) {
      console.error('Failed to get open windows:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchWindows()
  }, [])

  useEffect(() => {
    setHeaderAction(
      <button
        onClick={fetchWindows}
        disabled={isLoading}
        className="flex items-center gap-2 px-3 py-1.5 rounded bg-carbon-black-400 hover:bg-carbon-black-300 text-bright-snow text-xs font-semibold tracking-wider transition-colors border border-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span
          className={`material-symbols-outlined text-[14px] ${isLoading ? 'animate-spin' : ''}`}
        >
          refresh
        </span>
        REFRESH
      </button>,
    )

    // Cleanup when component unmounts
    return () => setHeaderAction(undefined)
  }, [setHeaderAction, isLoading])

  useEffect(() => {
    if (!filterByAppName) {
      setFilteredProcesses(processes)
      return
    }

    const appNames = filterByAppName
      .toLocaleLowerCase()
      .split(',')
      .map((appName) => appName.trim())

    const filteredProcesses = processes.filter((process) =>
      appNames.some((appName) => process.app_name.toLowerCase().includes(appName)),
    )

    setFilteredProcesses(filteredProcesses)
  }, [filterByAppName, processes])

  const handleClearFilters = () => {
    setFilterByAppName('')
  }

  // Helper to determine icon based on app name
  const getIconForApp = (appName: string) => {
    const name = appName.toLowerCase()
    if (EDITORS_ICONS.some((icon) => name.includes(icon))) return 'code'
    if (TERMINAL_ICONS.some((icon) => name.includes(icon))) return 'terminal'
    if (BROWSER_ICONS.some((icon) => name.includes(icon))) return 'public'
    if (name.includes('settings')) return 'settings'
    return 'window'
  }

  return (
    <div className="flex flex-col h-full -mx-6 -my-6">
      {/* Search Input Section */}
      <div className="px-6 pb-4 border-b border-white/5 sticky top-0 z-10 bg-carbon-black-400/95 backdrop-blur-3xl">
        <div className="bg-carbon-black-200 rounded-lg flex items-center px-4 py-3 border border-white/5 focus-within:border-bright-snow/30 transition-colors">
          <span className="material-symbols-outlined text-pale-slate mr-3 text-[20px]">
            filter_alt
          </span>
          <input
            onChange={(input) => setFilterByAppName(input.target.value)}
            value={filterByAppName}
            type="text"
            placeholder="Filter processes (e.g., chrome, terminal, dev-server)..."
            className="bg-transparent border-none outline-none w-full text-bright-snow placeholder-pale-slate/60 text-sm"
          />
          {filterByAppName && (
            <button
              onClick={handleClearFilters}
              className="ml-2 text-pale-slate hover:text-bright-snow transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Process List Section */}
      <div className="flex-1 overflow-y-auto px-6 py-4 mt-5 custom-scrollbar space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <span className="text-pale-slate animate-pulse text-sm font-semibold tracking-wider">
              LOADING PROCESSES...
            </span>
          </div>
        ) : filteredProcesses.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-pale-slate text-sm">
            No se encontraron procesos activos.
          </div>
        ) : (
          filteredProcesses.map((process) => (
            <button
              key={process.id}
              onClick={() => setSelectedProcess(process)}
              className={`w-full text-left flex items-center p-4 rounded-xl border transition-all duration-200 group ${
                selectedProcess?.id === process.id
                  ? 'bg-carbon-black-200 border-white/20 shadow-md'
                  : 'bg-carbon-black-300 border-transparent hover:bg-carbon-black-200 hover:border-white/10'
              }`}
            >
              <div className="bg-white/5 p-2.5 rounded-lg mr-4 text-pale-slate group-hover:text-bright-snow transition-colors flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">
                  {getIconForApp(process.app_name)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-bright-snow font-semibold text-sm mb-1">{process.title}</span>
                <span className="text-pale-slate text-xs font-mono uppercase tracking-wider">
                  {process.app_name} • ID: {process.id}
                </span>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Footer Section */}
      <div className="bg-carbon-black-300 px-6 py-4 flex justify-end gap-3 border-t border-white/5 mt-2 rounded-b-xl">
        <button
          onClick={closeModal}
          className="px-5 py-2.5 rounded-lg text-sm font-bold text-pale-slate hover:text-bright-snow hover:bg-white/5 transition-colors"
        >
          CANCEL
        </button>
        <button
          disabled={!selectedProcess}
          onClick={() => {
            if (selectedProcess) {
              changeConfig({
                attachedProcess: selectedProcess,
              })
              closeModal()
            }
          }}
          className="px-5 py-2.5 rounded-lg text-sm font-bold bg-white/10 text-bright-snow hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          ATTACH PROCESS
        </button>
      </div>
    </div>
  )
}
