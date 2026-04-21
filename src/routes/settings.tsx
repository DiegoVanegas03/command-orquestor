import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/settings')({
  component: Settings,
})

function Settings() {
  return (
    <main className="pt-24 p-12 max-w-6xl mx-auto w-full flex flex-col gap-10">
      <header>
        <h2 className="text-title-2 text-bright-snow mb-2">Configuración</h2>
        <p className="text-body-md text-pale-slate max-w-2xl">
          Preferencias del sistema y dinámicas de ejecución.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-carbon-black-200/80 backdrop-blur-md rounded-xl p-8 ring-1 ring-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.4)] flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-bright-snow">speed</span>
            <h3 className="text-caption text-bright-snow uppercase tracking-wider font-bold">
              Dinámicas de Ejecución
            </h3>
          </div>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-caption text-pale-slate uppercase tracking-wider">
                Velocidad de Escritura (ms)
              </label>
              <input
                className="bg-carbon-black-400 text-bright-snow text-body-md tracking-wide rounded-lg px-4 py-3 border-none outline-none focus:ring-1 focus:ring-bright-snow/30 transition-all"
                type="number"
                defaultValue={50}
              />
              <p className="text-caption text-pale-slate tracking-widest uppercase mt-1">
                Retraso entre las pulsaciones de teclado simuladas.
              </p>
            </div>
            <div className="flex items-center justify-between bg-carbon-black-700/50 p-4 rounded-lg ring-1 ring-white/5">
              <div className="flex flex-col">
                <span className="text-body-md text-bright-snow font-semibold">Modo Simulación</span>
                <span className="text-caption text-pale-slate">
                  Ejecutar flujos de trabajo sin afectar el estado real del SO.
                </span>
              </div>
              <button className="w-12 h-6 bg-carbon-black-400 rounded-full relative transition-colors duration-200 focus:outline-none">
                <div className="w-4 h-4 bg-pale-slate rounded-full absolute left-1 top-1 transition-transform duration-200"></div>
              </button>
            </div>
          </div>
        </section>

        <section className="bg-carbon-black-200/80 backdrop-blur-md rounded-xl p-8 ring-1 ring-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.4)] flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-bright-snow">keyboard</span>
            <h3 className="text-caption text-bright-snow uppercase tracking-wider font-bold">
              Atajos Globales
            </h3>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between bg-carbon-black-700/50 p-4 rounded-lg ring-1 ring-white/5">
              <span className="text-body-md text-bright-snow font-medium">
                Parada de Emergencia
              </span>
              <button className="bg-carbon-black-400 text-bright-snow px-4 py-2 rounded-lg text-caption font-bold uppercase tracking-widest hover:bg-carbon-black-600 transition-colors flex items-center gap-2 ring-1 ring-white/5">
                <span>CTRL + ALT + E</span>
                <span className="material-symbols-outlined text-[14px] text-pale-slate">edit</span>
              </button>
            </div>
            <div className="flex items-center justify-between bg-carbon-black-700/50 p-4 rounded-lg ring-1 ring-white/5">
              <span className="text-body-md text-bright-snow font-medium">Pausar / Reanudar</span>
              <button className="bg-carbon-black-400 text-bright-snow px-4 py-2 rounded-lg text-caption font-bold uppercase tracking-widest hover:bg-carbon-black-600 transition-colors flex items-center gap-2 ring-1 ring-white/5">
                <span>CTRL + SHIFT + P</span>
                <span className="material-symbols-outlined text-[14px] text-pale-slate">edit</span>
              </button>
            </div>
          </div>
        </section>

        <section className="bg-carbon-black-200/80 backdrop-blur-md rounded-xl p-8 ring-1 ring-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.4)] flex flex-col gap-6 lg:col-span-2">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-bright-snow">desktop_windows</span>
            <h3 className="text-caption text-bright-snow uppercase tracking-wider font-bold">
              Gestión de Ventanas
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-caption text-pale-slate uppercase tracking-wider">
                Regex de Objetivo por Defecto
              </label>
              <input
                className="bg-carbon-black-400 text-bright-snow text-body-md tracking-wide rounded-lg px-4 py-3 border-none outline-none focus:ring-1 focus:ring-bright-snow/30 transition-all"
                type="text"
                defaultValue="^CommandOrquestor.*"
              />
            </div>
            <div className="flex items-end">
              <button className="bg-carbon-black-400 text-bright-snow px-6 py-3 rounded-lg text-body-md font-semibold w-full hover:bg-carbon-black-600 transition-colors flex items-center justify-center gap-2 ring-1 ring-white/5">
                <span className="material-symbols-outlined text-[18px]">sync</span>
                Reescanear Ventanas Activas
              </button>
            </div>
          </div>
        </section>

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
            <button className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 px-6 py-3 rounded-lg font-semibold text-body-md transition-colors duration-200">
              Restablecer Sistema
            </button>
          </div>
        </section>
      </div>

      <div className="fixed bottom-12 right-12 z-50">
        <button className="bg-linear-to-br from-bright-snow-400 to-bright-snow-100 text-carbon-black px-8 py-4 rounded-xl font-semibold text-subtitle-2 shadow-[0_20px_40px_rgba(0,0,0,0.4)] hover:scale-95 transition-transform duration-200 flex items-center gap-2 uppercase tracking-wide">
          <span className="material-symbols-outlined text-[20px]">save</span>
          Guardar Cambios
        </button>
      </div>
    </main>
  )
}
