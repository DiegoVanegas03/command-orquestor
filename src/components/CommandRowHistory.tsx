import { CommandRecord } from '@/services/commands'
import { formatDates } from '@/utils/dates'
import EnvBadge from './shared/EnvBadge'

interface CommandRowHistoryProps {
  record: CommandRecord
  isCopy: boolean
  handleCopy: (record: CommandRecord) => void
  onRunAgain: (record: CommandRecord) => void
}

export function CommandRowHistory({ record, isCopy, handleCopy, onRunAgain }: CommandRowHistoryProps) {
  const { date, time } = formatDates(record.executed_at)



  return (
    <div className="grid grid-cols-[160px_1fr_120px_100px] gap-4 items-center px-4 py-3 rounded-lg bg-carbon-black-200/50 ring-1 ring-white/5 hover:ring-white/10 hover:bg-carbon-black-200/80 transition-all duration-150 group">
      {/* Timestamp */}
      <div className="flex flex-col font-mono">
        <span className="text-[11px] text-bright-snow/80">{date}</span>
        <span className="text-[10px] text-pale-slate/50 mt-0.5">{time}</span>
      </div>

      {/* Command */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-pale-slate/40 font-mono text-[12px] select-none shrink-0">$</span>
        <code className="text-bright-snow text-[12px] font-mono truncate flex-1 bg-carbon-black-400/40 px-2 py-1 rounded">
          {record.command}
        </code>
        <button
          onClick={()=>handleCopy(record)}
          title="Copiar comando"
          className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded text-pale-slate hover:text-bright-snow"
        >
          <span className="material-symbols-outlined text-[14px]">
            {isCopy ? 'check' : 'content_copy'}
          </span>
        </button>
      </div>

      {/* Environment badge */}
      <EnvBadge env={record.enviroment} />

      {/* Actions */}
      <button
        onClick={() => onRunAgain(record)}
        title="Ejecutar de nuevo"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-carbon-black-400 text-bright-snow text-[11px] font-semibold uppercase tracking-wider hover:bg-carbon-black-600 transition-colors ring-1 ring-white/5 whitespace-nowrap"
      >
        <span className="material-symbols-outlined text-[14px]">replay</span>
        Repetir
      </button>
    </div>
  )
}
