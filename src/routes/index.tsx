import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'

import ToggleButtonGroup from '@/components/shared/ToggleButtonGroup'
import SpeedSlider from '@/components/shared/SpeedSlider'
import CommandInput from '@/components/CommandInput'
import ExecutionButton from '@/components/ExecutionButton'
import { commandsService } from '@/services/commands'
import { useConfigStore } from '@/stores/useConfigStore'
import SettingsCard from '@/components/SettingsCard'

export const Route = createFileRoute('/')({
  component: Dashboard,
  loader: async () => {
    const history = await commandsService.getCommandHistory(15)
    return { history }
  },
})

function Dashboard() {
  // Consumimos la información cargada de manera síncrona
  const { history } = Route.useLoaderData()

  const { typingSpeed, environment, attachedProcess, changeConfig } = useConfigStore()

  const [command, setCommand] = useState('')

  const handleCommandChange = (command: string) => {
    setCommand(command)
  }

  const handleEnviromentChange = (environment: string) => {
    if (environment !== 'production' && environment !== 'sandbox') return
    changeConfig({ environment })
  }

  const handleSpeedChange = (speed: number) => {
    changeConfig({ typingSpeed: speed })
  }

  const handleExecution = () => {}

  return (
    <main className=" p-12 max-w-7xl mx-auto w-full flex flex-col gap-10">
      <div className="mb-2">
        <h2 className="text-title-2 text-bright-snow mb-2">Consola de Ejecución</h2>
        <p className="text-body-md text-pale-slate max-w-2xl">
          Monitorea procesos activos y configura parámetros de despliegue. Asegúrate de que las
          variables de entorno objetivo estén alineadas antes de iniciar la secuencia.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Area: Terminal Panel (col-span-8) */}
        <div className="lg:col-span-8 flex flex-col h-full min-h-[600px]">
          <div className="flex-1 flex flex-col bg-carbon-black-300/40 backdrop-blur-xl rounded-xl p-2 relative overflow-hidden ring-1 ring-white/10">
            {/* Terminal Header Bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-carbon-black-100/50 rounded-t-lg mb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-bright-snow text-sm">terminal</span>
                <span className="text-caption text-bright-snow font-bold uppercase tracking-widest">
                  Output
                </span>
              </div>
              <div className="flex gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-carbon-black-400 ring-1 ring-white/30"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-carbon-black-400 ring-1 ring-white/30"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-bright-snow/80 shadow-[0_0_8px_rgba(255,255,255,0.5)]"></div>
              </div>
            </div>

            {/* Output Area */}
            <div className="flex-1 bg-carbon-black-100 rounded-lg p-6 overflow-y-auto font-mono text-sm leading-relaxed text-pale-slate relative shadow-[inset_0_4px_20px_rgba(0,0,0,0.5)]">
              <div className="mb-2">
                <span className="text-pale-slate-400">[SYS]</span> Inicializando entorno de
                ejecución Orquestor v2.4.1...
              </div>
              <div className="mb-2">
                <span className="text-pale-slate-400">[SYS]</span> Cargando configuración desde el
                manifiesto estándar.
              </div>
              <div className="mb-2">
                <span className="text-platinum-400"> -&gt; Validando endpoints... OK</span>
              </div>
              <div className="mb-2">
                <span className="text-platinum-400"> -&gt; Asignando pool de memoria... OK</span>
              </div>
              <div className="mb-2 text-bright-snow font-bold">
                <span className="text-pale-slate-400">[EXEC]</span> Listo para la secuencia de
                comandos.
              </div>
              <div className="mb-2 text-pale-slate opacity-50">
                Esperando entrada del usuario...
              </div>
              <div className="absolute bottom-6 left-6 flex items-center gap-2 text-bright-snow">
                <span className="material-symbols-outlined text-sm animate-pulse">
                  chevron_right
                </span>
                <span className="w-2 h-4 bg-bright-snow animate-pulse"></span>
              </div>
            </div>

            {/* Prompt Input Area */}
            <CommandInput
              value={command}
              onChange={handleCommandChange}
              placeholder="Introduce el comando de ejecución..."
            />
          </div>
        </div>

        {/* Right Area: Parameters Panel (col-span-4) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-carbon-black-200/80 min-h-[400px] flex flex-col backdrop-blur-md rounded-xl p-6 ring-1 ring-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
            <h3 className="text-caption text-bright-snow font-bold uppercase tracking-wider mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">tune</span>
              Parámetros
            </h3>

            {/* Target Environment */}
            <div className="mb-8">
              <label className="block text-caption text-pale-slate uppercase tracking-wider mb-3">
                Entorno de ejecución
              </label>
              <ToggleButtonGroup
                options={[
                  { value: 'production', label: 'Producción', icon: 'public' },
                  { value: 'sandbox', label: 'Pruebas', icon: 'science' },
                ]}
                value={environment}
                onChange={handleEnviromentChange}
              />
            </div>

            {/* Target Window Card */}
            <div className="mb-6 flex-1">
              <label className="block text-caption text-pale-slate uppercase tracking-wider mb-3">
                Ventana Destino
              </label>

              {environment === 'production' ? (
                attachedProcess ? (
                  <div className="bg-carbon-black-300 border border-white/10 rounded-xl p-4 flex items-center gap-4 shadow-sm">
                    <div className="bg-white/5 p-2.5 rounded-lg text-bright-snow flex items-center justify-center">
                      <span className="material-symbols-outlined text-[20px]">desktop_windows</span>
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-bright-snow font-semibold text-sm truncate mb-0.5">
                        {attachedProcess.title}
                      </span>
                      <span className="text-pale-slate text-xs font-mono uppercase tracking-wider">
                        {attachedProcess.app_name}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-950/30 border border-red-500/20 rounded-xl p-5 flex flex-col items-center justify-center gap-3 text-center shadow-inner">
                    <span className="material-symbols-outlined text-red-400 text-[28px] animate-pulse">
                      error
                    </span>
                    <div className="flex flex-col gap-1">
                      <span className="text-red-200 font-bold text-sm tracking-wide">
                        VENTANA NO SELECCIONADA
                      </span>
                      <span className="text-red-300/60 text-xs">
                        Es obligatorio asignar un destino en producción.
                      </span>
                    </div>
                    <Link
                      to="/settings"
                      className="mt-2 px-5 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs font-bold tracking-wider rounded-lg transition-colors border border-red-500/20 flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[14px]">settings</span>
                      CONFIGURAR AHORA
                    </Link>
                  </div>
                )
              ) : (
                <div className="bg-carbon-black-300 border border-white/5 rounded-xl p-4 flex items-center gap-4 opacity-80">
                  <div className="bg-bright-snow/10 p-2.5 rounded-lg text-bright-snow flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">science</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-bright-snow font-semibold text-sm mb-0.5">
                      Modo Sandbox Activo
                    </span>
                    <span className="text-pale-slate text-xs">
                      Los comandos se ejecutarán en el entorno seguro.
                    </span>
                  </div>
                </div>
              )}
            </div>

            <SpeedSlider initialValue={typingSpeed} onChange={handleSpeedChange} />

            <ExecutionButton disabled={!attachedProcess} onClick={handleExecution} />
          </div>

          <SettingsCard icon="history" title="Historial de Ejecución">
            {history.length === 0 ? (
              <div className=" text-center flex flex-col items-center gap-3">
                <span className="material-symbols-outlined text-pale-slate/40 text-[40px]">
                  history_toggle_off
                </span>
                <p className="text-pale-slate text-sm">Aún no hay comandos en el historial.</p>
              </div>
            ) : (
              <div className="relative border-l-2 border-white/5 ml-3 pl-6 py-2 flex flex-col gap-6 max-h-[320px] overflow-y-auto pr-2">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="relative group cursor-pointer"
                    onClick={() => setCommand(item.command)}
                  >
                    {/* Timeline Dot */}
                    <div className="absolute left-[31px] top-4 w-3 h-3 rounded-full bg-carbon-black-400 border-2 border-white/20 group-hover:border-bright-snow group-hover:bg-bright-snow transition-all duration-300 shadow-[0_0_10px_rgba(255,255,255,0)] group-hover:shadow-[0_0_10px_rgba(255,255,255,0.3)] z-10"></div>

                    {/* Content Card */}
                    <div className="bg-carbon-black-400/30 hover:bg-carbon-black-300/80 border border-transparent hover:border-white/10 rounded-xl p-4 transition-all duration-200">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-mono text-pale-slate/70 uppercase tracking-widest flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[12px]">schedule</span>
                          {item.date}
                        </span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity text-pale-slate hover:text-bright-snow">
                          <span className="text-[10px] font-bold tracking-wider">USAR</span>
                          <span className="material-symbols-outlined text-[14px]">input</span>
                        </div>
                      </div>
                      <p className="text-sm font-mono text-bright-snow leading-relaxed whitespace-pre-wrap line-clamp-2 opacity-90 group-hover:opacity-100">
                        {item.command}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SettingsCard>
        </div>
      </div>
    </main>
  )
}
