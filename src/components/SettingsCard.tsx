interface SettingsCardProps {
  icon: string
  title: string
  children: React.ReactNode
  classNames?: string
}

export default function SettingsCard({ icon, title, children, classNames }: SettingsCardProps) {
  return (
    <section className={`bg-carbon-black-200/80 backdrop-blur-md rounded-xl p-8 ring-1 ring-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.4)] flex flex-col gap-6 ${classNames}`}>
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-bright-snow">{icon}</span>
        <h3 className="text-caption text-bright-snow uppercase tracking-wider font-bold">
          {title}
        </h3>
      </div>
      {children}
    </section>
  )
}
