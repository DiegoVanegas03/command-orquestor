import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { invoke } from '@tauri-apps/api/core'
import { useState, useCallback } from 'react'
import { commandsService } from '@/services/commands'
import Divisor from '@/components/shared/Divisor'
import { CommandRowHistory } from '@/components/CommandRowHistory'
import { CommandRecord } from '@/services/commands'
import { sileo } from 'sileo'

const COLUMNS = ['Fecha / Hora', 'Comando ejecutado', 'Entorno', 'Acciones'] as const

export const Route = createFileRoute('/history')({
  component: HistoryPage,
  loader: async () => {
    const records = await commandsService.getCommandHistory(100)
    return { records }
  },
})

function HistoryPage() {
  const loaderData = Route.useLoaderData()
  const [records, setRecords] = useState<CommandRecord[]>(loaderData.records)
  const [search, setSearch] = useState('')
  const [envFilter, setEnvFilter] = useState<'all' | 'production' | 'sandbox'>('all')

  const [copied, setCopied] = useState<string | null>(null)

  const handleCopy = async (record: CommandRecord) => {
    sileo.success({
      title: 'Comando copiado',
      icon: <span className="material-symbols-outlined text-[18px]">content_copy</span>,
      duration: 1500,
    })
    await navigator.clipboard.writeText(record.command)

    setCopied(record.id.toString())
    setTimeout(() => setCopied(null), 1500)
  }

  const refresh = useCallback(async () => {
    const fresh: CommandRecord[] = await invoke('get_commands', { limit: 100 })
    setRecords(fresh)
  }, [])

  const navigate = useNavigate({ from: Route.fullPath })

  const handleRunAgain = (record: CommandRecord) => {
    navigate({ to: '/', search: { cmd: record.command } })
  }

  const filtered = records.filter((r) => {
    const matchEnv = envFilter === 'all' || r.enviroment === envFilter
    const matchSearch = !search || r.command.toLowerCase().includes(search.toLowerCase())
    return matchEnv && matchSearch
  })

  return (
    <main className="px-6 py-8 max-w-6xl mx-auto flex flex-col gap-6 h-full">
      {/* ---- Page Header ---- */}
      <div className="flex items-start justify-between pt-12">
        <div>
          <h2 className="text-title-2 text-bright-snow font-bold tracking-tight">
            Historial de Comandos
          </h2>
          <p className="text-body-sm text-pale-slate mt-1">
            Registro de ejecuciones ordenadas por fecha descendente.
          </p>
        </div>

        {/* Refresh */}
        <button
          onClick={refresh}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-carbon-black-400 text-bright-snow text-body-sm font-semibold hover:bg-carbon-black-600 transition-colors ring-1 ring-white/5"
        >
          <span className="material-symbols-outlined text-[16px]">sync</span>
          Actualizar
        </button>
      </div>

      <Divisor />

      {/* ---- Filters ---- */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-carbon-black-200/80 ring-1 ring-white/10 rounded-lg px-3 py-2">
          <span className="material-symbols-outlined text-pale-slate/50 text-[18px]">search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por comando..."
            className="bg-transparent text-bright-snow text-body-sm outline-none flex-1 placeholder:text-pale-slate/40"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-pale-slate/40 hover:text-pale-slate transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          )}
        </div>

        {/* Env filter tabs */}
        <div className="flex items-center gap-1 bg-carbon-black-200/80 ring-1 ring-white/10 rounded-lg p-1">
          {(['all', 'production', 'sandbox'] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => setEnvFilter(opt)}
              className={`px-3 py-1.5 rounded-md text-[11px] font-semibold uppercase tracking-wider transition-all ${
                envFilter === opt
                  ? 'bg-bright-snow text-carbon-black shadow'
                  : 'text-pale-slate hover:text-bright-snow'
              }`}
            >
              {opt === 'all' ? 'Todos' : opt === 'production' ? 'Producción' : 'Pruebas'}
            </button>
          ))}
        </div>

        {/* Count */}
        <span className="text-[11px] text-pale-slate/50 font-mono">
          {filtered.length} registro{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ---- Table ---- */}
      <div className="flex flex-col gap-2 flex-1 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 py-16">
            <span className="material-symbols-outlined text-pale-slate/20 text-[56px]">
              history_toggle_off
            </span>
            <p className="text-pale-slate/40 text-xs uppercase tracking-widest font-mono">
              {search || envFilter !== 'all'
                ? 'Sin resultados para los filtros aplicados'
                : 'Sin registros aún'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="grid grid-cols-[160px_1fr_120px_100px] gap-4 px-4 pb-2">
              {COLUMNS.map((col) => (
                <span
                  key={col}
                  className="text-[10px] font-bold uppercase tracking-widest text-pale-slate/50 font-mono"
                >
                  {col}
                </span>
              ))}
            </div>
            <div className="flex flex-col gap-2 overflow-y-auto pr-1 flex-1">
              {filtered.map((record) => (
                <CommandRowHistory
                  isCopy={copied === record.id.toString()}
                  handleCopy={handleCopy}
                  key={record.id}
                  record={record}
                  onRunAgain={handleRunAgain}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
