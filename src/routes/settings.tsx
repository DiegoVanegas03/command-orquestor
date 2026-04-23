import SettingsCard from '@/components/SettingsCard'
import { createFileRoute } from '@tanstack/react-router'
import { WindowSelectionModalContent } from '@/components/WindowSelectionModalContent'

import { useModalStore } from '@/stores/useModalStore'
import { useConfigStore } from '@/stores/useConfigStore'

export const Route = createFileRoute('/settings')({
  component: Settings,
})

function Settings() {
  const { openModal } = useModalStore()

  const { attachedProcess, typingSpeed, globalShortcuts, changeConfig } = useConfigStore()

  const stopShortcut = globalShortcuts.find((s) => s.type === 'stop')
  //const pauseShortcut = globalShortcuts.find((s) => s.type === 'pause')

  const handleSearchActiveWindows = () => {
    openModal('Selección de ventana', <WindowSelectionModalContent />, {
      subtitle: 'SELECCCIONA UNA VENTANA PARA ADJUNTAR EL ORQUESTADOR',
    })
  }

  const handleChangeTypingSpeed = (event: React.ChangeEvent<HTMLInputElement>) => {
    changeConfig({ typingSpeed: Number(event.target.value) })
  }

  return (
    <main className="pt-16 p-12 max-w-6xl mx-auto w-full flex flex-col gap-10">
      <header>
        <h2 className="text-title-2 text-bright-snow mb-2">Configuración</h2>
        <p className="text-body-md text-pale-slate max-w-2xl">
          Preferencias del sistema y dinámicas de ejecución.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SettingsCard icon="speed" title="Dinámicas de Ejecución">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-caption text-pale-slate uppercase tracking-wider">
                Retraso de Escritura (ms)
              </label>
              <input
                className="bg-carbon-black-400 text-bright-snow text-body-md tracking-wide rounded-lg px-4 py-3 border-none outline-none focus:ring-1 focus:ring-bright-snow/30 transition-all"
                type="number"
                value={typingSpeed}
                onChange={handleChangeTypingSpeed}
              />
              <p className="text-caption text-pale-slate tracking-widest uppercase mt-1">
                Retraso entre las pulsaciones de teclado simuladas.
              </p>
            </div>
          </div>
        </SettingsCard>

        <SettingsCard icon="keyboard" title="Atajos Globales">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between bg-carbon-black-700/50 p-4 rounded-lg ring-1 ring-white/5">
              <span className="text-body-md text-bright-snow font-medium">
                Parada de Emergencia
              </span>
              <button className="bg-carbon-black-400 whitespace-nowrap text-bright-snow px-4 py-2 rounded-lg text-caption font-bold uppercase tracking-widest hover:bg-carbon-black-600 transition-colors flex items-center gap-2 ring-1 ring-white/5">
                {stopShortcut && stopShortcut.keys.size === 0 ? (
                  <span>Sin configurar</span>
                ) : (
                  <span>{[...stopShortcut!.keys].join(' + ')}</span>
                )}
                <span className="material-symbols-outlined text-[14px] text-pale-slate">edit</span>
              </button>
            </div>
            <div className="flex items-center justify-between bg-carbon-black-700/50 p-4 rounded-lg ring-1 ring-white/5">
              <span className="text-body-md text-bright-snow font-medium">Pausar / Reanudar</span>
              <button className="bg-carbon-black-400 whitespace-nowrap text-bright-snow px-4 py-2 rounded-lg text-caption font-bold uppercase tracking-widest hover:bg-carbon-black-600 transition-colors flex items-center gap-2 ring-1 ring-white/5">
                <span>CTRL + SHIFT + P</span>
                <span className="material-symbols-outlined text-[14px] text-pale-slate">edit</span>
              </button>
            </div>
          </div>
        </SettingsCard>

        <SettingsCard icon="desktop_windows" title="Gestión de ventanas" classNames="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-caption text-pale-slate uppercase tracking-wider">
                Proceso destino
              </label>
              <input
                className="bg-carbon-black-400 text-bright-snow text-body-md tracking-wide rounded-lg px-4 py-3 border-none outline-none focus:ring-1 focus:ring-bright-snow/30 transition-all"
                type="text"
                placeholder="Selecciona una ventana"
                disabled
                value={
                  attachedProcess
                    ? `${attachedProcess?.app_name} - ${attachedProcess?.title} - ${attachedProcess?.id}`
                    : undefined
                }
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleSearchActiveWindows}
                className="bg-carbon-black-400 text-bright-snow px-6 py-3 rounded-lg text-body-md font-semibold w-full hover:bg-carbon-black-600 transition-colors flex items-center justify-center gap-2 ring-1 ring-white/5"
              >
                <span className="material-symbols-outlined text-[18px]">sync</span>
                Seleccionar Proceso Destino
              </button>
            </div>
          </div>
        </SettingsCard>

        <section className="bg-red-900/20 backdrop-blur-sm border border-red-500/20 rounded-xl p-8 flex flex-col gap-6 lg:col-span-2">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-red-400">warning</span>
            <h3 className="text-caption text-red-400 uppercase tracking-wider font-bold">
              Zona de Peligro
            </h3>
          </div>
          <div className="flex items-center justify-between bg-carbon-black-700/30 p-6 rounded-lg ring-1 ring-red-500/10">
            <div className="flex flex-col">
              <span className="text-body-md text-red-400 font-bold">
                Restablecimiento de Fábrica
              </span>
              <span className="text-caption text-pale-slate mt-1">
                Borrar todos los flujos personalizados, historial y restaurar configuraciones por
                defecto. Esta acción no se puede deshacer.
              </span>
            </div>
            <button className="bg-red-500/10 whitespace-nowrap text-red-400 hover:bg-red-500/20 border border-red-500/30 px-4 md:px-6 py-1 md:py-3 rounded-lg font-semibold text-body-md transition-colors duration-200">
              Restablecer Sistema
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}
