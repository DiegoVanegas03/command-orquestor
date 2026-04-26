import { CommandRecord } from '@/services/commands'

const ENV_STYLES: Record<string, { label: string; dot: string; badge: string }> = {
  production: {
    label: 'Producción',
    dot: 'bg-emerald-400',
    badge: 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30',
  },
  sandbox: {
    label: 'Pruebas',
    dot: 'bg-amber-400',
    badge: 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/30',
  },
}

export default function EnvBadge({ env }: { env: CommandRecord['enviroment'] }) {
  const s = ENV_STYLES[env] ?? {
    label: env,
    dot: 'bg-pale-slate',
    badge: 'bg-white/5 text-pale-slate ring-1 ring-white/10',
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${s.badge}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  )
}
