import { useState } from 'react'
import { getCurrentWindow, LogicalSize } from '@tauri-apps/api/window'

// Dimensiones de la ventana compacta (modo "siempre encima")
const COMPACT_WIDTH = 480
const COMPACT_HEIGHT = 700

export default function TopNavBar() {
  const [isPinned, setIsPinned] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const handlePinToggle = async () => {
    if (isTransitioning) return

    setIsTransitioning(true)
    const win = getCurrentWindow()

    try {
      if (!isPinned) {
        // Activar modo compacto: siempre encima + tamaño reducido + sin redimensionar
        await win.setAlwaysOnTop(true)
        await win.setResizable(false)
        await win.setSize(new LogicalSize(COMPACT_WIDTH, COMPACT_HEIGHT))
        setIsPinned(true)
      } else {
        // Desactivar modo compacto: restaurar y maximizar
        await win.setAlwaysOnTop(false)
        await win.setResizable(true)
        await win.setSize(new LogicalSize(1280, 720))
        await win.maximize()
        setIsPinned(false)
      }
    } catch (e) {
      console.error('Error toggling pin mode:', e)
    } finally {
      setIsTransitioning(false)
    }
  }

  return (
    <header className="fixed top-0 right-0 w-full xl:w-[calc(100%-16rem)] h-16 bg-carbon-black z-40 border-b border-white/5 transition-all duration-300">
      <div className="flex items-center justify-between px-12 h-full gap-6">
        <div className="flex-1"></div>

        <div className="flex items-center gap-6">
          {/* Buscador */}
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

          {/* Toggle: Siempre encima */}
          <button
            onClick={handlePinToggle}
            disabled={isTransitioning}
            title={isPinned ? 'Desanclar ventana' : 'Mantener siempre encima (modo compacto)'}
            className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-300 disabled:opacity-50 disabled:cursor-wait ${
              isPinned
                ? 'bg-bright-snow/10 border-bright-snow/30 text-bright-snow'
                : 'bg-transparent border-white/5 text-pale-slate hover:text-bright-snow hover:border-white/15'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[18px] transition-transform duration-300 ${
                isPinned
                  ? 'rotate-0 text-bright-snow drop-shadow-[0_0_6px_rgba(255,255,255,0.7)]'
                  : 'group-hover:rotate-12'
              }`}
            >
              push_pin
            </span>
            <span className="text-[11px] font-bold tracking-widest uppercase hidden sm:block">
              {isPinned ? 'Anclado' : 'Anclar'}
            </span>
          </button>

          {/* Notificaciones */}
          <button className="text-pale-slate hover:text-bright-snow transition-colors flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">notifications</span>
          </button>
        </div>
      </div>
    </header>
  )
}
