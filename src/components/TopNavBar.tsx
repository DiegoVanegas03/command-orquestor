export default function TopNavBar() {
  return (
    <header className="fixed top-0 right-0 w-full md:w-[calc(100%-16rem)] h-16 bg-carbon-black z-40 border-b border-white/5 transition-all duration-300">
      <div className="flex items-center justify-between px-12 h-full gap-6">
        <div className="flex-1"></div>
        <div className="flex items-center gap-6">
          <div className="relative w-64 group">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-grey text-sm group-focus-within:text-bright-snow transition-colors">
              search
            </span>
            <input
              className="w-full bg-carbon-black-300 text-bright-snow text-body-md tracking-wide rounded-lg pl-10 pr-4 py-2 border-none outline-none focus:ring-1 focus:ring-bright-snow/30 transition-all placeholder:text-slate-grey"
              placeholder="Buscar parámetros..."
              type="text"
            />
          </div>
          <button className="text-pale-slate hover:text-bright-snow transition-colors flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">notifications</span>
          </button>
        </div>
      </div>
    </header>
  )
}
