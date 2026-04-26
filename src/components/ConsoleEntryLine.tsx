import { type ConsoleEntry } from '@/stores/useConsoleStore'
import { formatTime } from '@/utils/dates'

const LEVEL_STYLES: Record<string, { badge: string; badgeClass: string; textClass: string }> = {
  sys: { badge: '[SYS]', badgeClass: 'text-pale-slate/70', textClass: 'text-pale-slate' },
  exec: {
    badge: '[EXEC]',
    badgeClass: 'text-bright-snow/80',
    textClass: 'text-bright-snow font-bold',
  },
  ok: { badge: '[OK]', badgeClass: 'text-emerald-400/80', textClass: 'text-emerald-300' },
  warn: { badge: '[WARN]', badgeClass: 'text-amber-400/80', textClass: 'text-amber-300' },
  error: { badge: '[ERR]', badgeClass: 'text-red-400/80', textClass: 'text-red-300' },
  info: {
    badge: '[INFO]',
    badgeClass: 'text-pale-slate/40',
    textClass: 'text-pale-slate/60 italic',
  },
  clear: {
    badge: '[CLR]',
    badgeClass: 'text-pale-slate/30',
    textClass: 'text-pale-slate/30 italic',
  },
}

export default function ConsoleEntryLine({ entry }: { entry: ConsoleEntry }) {
  const style = LEVEL_STYLES[entry.level] ?? LEVEL_STYLES.info

  return (
    <div className="flex items-start gap-2 py-0.5 group">
      {/* Timestamp */}
      <span className="text-[10px] text-pale-slate/30 font-mono pt-0.5 w-[62px] shrink-0 select-none">
        {formatTime(entry.timestamp)}
      </span>

      {/* Badge */}
      <span
        className={`text-[11px] font-bold font-mono shrink-0 pt-px w-[52px] ${style.badgeClass}`}
      >
        {style.badge}
      </span>

      {/* Message */}
      <span className={`text-[12px] font-mono leading-relaxed flex-1 ${style.textClass}`}>
        {entry.message}
      </span>
    </div>
  )
}
