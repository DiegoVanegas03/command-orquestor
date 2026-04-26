import { createFileRoute, Link } from '@tanstack/react-router'
import { invoke } from '@tauri-apps/api/core'
import { useState, useEffect, useRef } from 'react'
import { useConsoleStore } from '@/stores/useConsoleStore'

import ToggleButtonGroup from '@/components/shared/ToggleButtonGroup'
import SpeedSlider from '@/components/shared/SpeedSlider'
import CommandInput from '@/components/CommandInput'
import ExecutionButton from '@/components/ExecutionButton'
import { commandsService } from '@/services/commands'
import { useConfigStore } from '@/stores/useConfigStore'
import SettingsCard from '@/components/SettingsCard'
import ConsoleEntryLine from '@/components/ConsoleEntryLine'

export const Route = createFileRoute('/')({
  component: Dashboard,
  loader: async () => {
    const history = await commandsService.getCommandHistory(15)
    return { history }
  },
})

function Dashboard() {
  // Inicializamos el historial desde el loader y lo manejamos como estado local
  // para poder actualizarlo sin recargar la ruta completa.
  const loaderData = Route.useLoaderData()
  const [history, setHistory] = useState(loaderData.history)

  const refreshHistory = async () => {
    const updated = await commandsService.getCommandHistory(15)
    setHistory(updated)
  }

  const { typingSpeed, environment, attachedProcess, executionMode, manualDelay, changeConfig } =
    useConfigStore()

  const [command, setCommand] = useState('')
  const [countdown, setCountdown] = useState<number | null>(null)
  const [isWayland, setIsWayland] = useState(false)

  useEffect(() => {
    invoke<boolean>('is_wayland')
      .then((wayland) => {
        setIsWayland(wayland)
        if (wayland && executionMode === 'automatic') {
          changeConfig({ executionMode: 'manual' })
        }
      })
      .catch(console.error)
  }, [executionMode, changeConfig])

  const handleCommandChange = (command: string) => {
    setCommand(command)
  }

  const handleEnviromentChange = (environment: string) => {
    if (environment !== 'production' && environment !== 'sandbox') return
    changeConfig({ environment })
  }

  const handleExecutionModeChange = (mode: string) => {
    if (mode !== 'automatic' && mode !== 'manual') return
    changeConfig({ executionMode: mode as 'automatic' | 'manual' })
  }

  const handleSpeedChange = (speed: number) => {
    changeConfig({ typingSpeed: speed })
  }

  const handleManualDelayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    changeConfig({ manualDelay: val === '' ? '' : Number(val) })
  }

  const { entries, log, clear } = useConsoleStore()
  const consoleEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll al fondo cuando llegan nuevas entradas
  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [entries])

  const handleExecution = async () => {
    if (!command.trim()) return

    const pid =
      environment === 'production' && executionMode === 'automatic'
        ? attachedProcess?.process_id
        : undefined

    log('exec', `$ ${command}`)

    if (environment === 'production' && executionMode === 'automatic' && !attachedProcess) {
      log(
        'error',
        'No hay ventana destino seleccionada. Ve a Configuración para adjuntar un proceso.',
      )
      return
    }

    if (environment === 'production' && executionMode === 'manual') {
      log(
        'info',
        `→ Modo manual — Iniciando en ${manualDelay} segundos. Cambia a la ventana destino ahora.`,
      )

      const delay = Number(manualDelay) || 0
      for (let i = delay; i > 0; i--) {
        setCountdown(i)
        await new Promise((r) => setTimeout(r, 1000))
      }
      setCountdown(null)
      log('sys', `→ Ejecutando comandos...`)
    } else if (pid) {
      log('sys', `→ Enfocando proceso PID ${pid} (${attachedProcess?.app_name})...`)
    } else {
      log('info', '→ Modo sandbox — ejecutando sin ventana destino.')
    }

    try {
      const speed = Number(typingSpeed) || 50
      const result = await commandsService.executeSequence(command, speed, environment, pid)
      if (result.success) {
        log('ok', `✓ ${result.message}`)
        await refreshHistory() // Actualizar timeline tras ejecución exitosa
      } else {
        log('error', `✗ ${result.message}`)
      }
    } catch (e) {
      log('error', `✗ Error inesperado: ${String(e)}`)
    }
  }

  const executionButtonDisabled =
    (executionMode === 'automatic' && !attachedProcess) || !command.trim()

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
        <div className="lg:col-span-8 flex flex-col h-full min-h-[600px] max-h-screen">
          <div className="flex-1 flex flex-col bg-carbon-black-300/40 backdrop-blur-xl rounded-xl p-2 relative overflow-hidden ring-1 ring-white/10">
            {/* Terminal Header Bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-carbon-black-100/50 rounded-t-lg mb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-bright-snow text-sm">terminal</span>
                <span className="text-caption text-bright-snow font-bold uppercase tracking-widest">
                  Output
                </span>
                <span className="text-[10px] font-mono text-pale-slate/40 ml-1">
                  {entries.length} líneas
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={clear}
                  title="Limpiar consola"
                  className="text-pale-slate/50 hover:text-pale-slate transition-colors flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider"
                >
                  <span className="material-symbols-outlined text-[14px]">mop</span>
                  Clear
                </button>
                <div className="flex gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-carbon-black-400 ring-1 ring-white/30"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-carbon-black-400 ring-1 ring-white/30"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-bright-snow/80 shadow-[0_0_8px_rgba(255,255,255,0.5)]"></div>
                </div>
              </div>
            </div>

            {/* Output Area */}
            <div className="flex-1 bg-carbon-black-100 rounded-lg p-4 overflow-y-auto font-mono text-sm leading-relaxed text-pale-slate shadow-[inset_0_4px_20px_rgba(0,0,0,0.5)] flex flex-col gap-0.5">
              {entries.map((entry) => (
                <ConsoleEntryLine key={entry.id} entry={entry} />
              ))}

              {/* Cursor parpadeante al final */}
              <div className="flex items-center gap-2 text-bright-snow mt-2">
                <span className="material-symbols-outlined text-sm animate-pulse">
                  chevron_right
                </span>
                <span className="w-2 h-4 bg-bright-snow animate-pulse"></span>
              </div>

              {/* Ancla para auto-scroll */}
              <div ref={consoleEndRef} />
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

            {/* Target Window Card / Manual Config */}
            <div className="mb-6 flex-1 flex flex-col gap-4">
              {environment === 'production' && (
                <div>
                  <label className="block text-caption text-pale-slate uppercase tracking-wider mb-3">
                    Modo de Ejecución
                  </label>
                  <ToggleButtonGroup
                    options={[
                      { 
                        value: 'automatic', 
                        label: isWayland ? 'Automático (No Soportado)' : 'Automático', 
                        icon: 'auto_awesome',
                        disabled: isWayland 
                      },
                      { value: 'manual', label: 'Manual', icon: 'pan_tool' },
                    ]}
                    value={executionMode}
                    onChange={handleExecutionModeChange}
                  />
                  {isWayland && (
                    <p className="text-red-400 text-xs mt-2 font-mono tracking-wide">
                      El modo automático está deshabilitado debido a restricciones de Wayland en Linux.
                    </p>
                  )}
                </div>
              )}

              {environment === 'production' ? (
                executionMode === 'automatic' ? (
                  <>
                    <label className="block text-caption text-pale-slate uppercase tracking-wider mb-1 mt-2">
                      Ventana Destino
                    </label>
                    {attachedProcess ? (
                      <div className="bg-carbon-black-300 border border-white/10 rounded-xl p-4 flex items-center gap-4 shadow-sm">
                        <div className="bg-white/5 p-2.5 rounded-lg text-bright-snow flex items-center justify-center">
                          <span className="material-symbols-outlined text-[20px]">
                            desktop_windows
                          </span>
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
                    )}
                  </>
                ) : (
                  <div className="flex flex-col gap-2 mt-2">
                    <label className="text-caption text-pale-slate uppercase tracking-wider">
                      Retraso de Inicio (segundos)
                    </label>
                    <input
                      className="bg-carbon-black-400 text-bright-snow text-body-md tracking-wide rounded-lg px-4 py-3 border-none outline-none focus:ring-1 focus:ring-bright-snow/30 transition-all w-full"
                      type="number"
                      value={manualDelay}
                      onChange={handleManualDelayChange}
                      min={1}
                      max={60}
                    />
                    <p className="text-caption text-pale-slate tracking-widest uppercase mt-1">
                      Tiempo para cambiar a la ventana destino.
                    </p>
                  </div>
                )
              ) : (
                <>
                  <label className="block text-caption text-pale-slate uppercase tracking-wider mb-3">
                    Modo
                  </label>
                  <div className="bg-carbon-black-300 border border-white/5 rounded-xl p-4 flex items-center gap-4 opacity-80">
                    <div className="bg-bright-snow/10 p-2.5 rounded-lg text-bright-snow flex items-center justify-center">
                      <span className="material-symbols-outlined text-[20px]">science</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-bright-snow font-semibold text-sm mb-0.5">
                        Modo Sandbox Activo
                      </span>
                      <span className="text-pale-slate text-xs">
                        Los comandos se ejecutaran en el entorno seguro.
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <SpeedSlider initialValue={Number(typingSpeed) || 0} onChange={handleSpeedChange} />

            <ExecutionButton disabled={executionButtonDisabled} onClick={handleExecution} />
          </div>

          <SettingsCard icon="history" title="Historial de Ejecución">
            {history.length === 0 ? (
              <div className="text-center flex flex-col items-center gap-3 py-4">
                <span className="material-symbols-outlined text-pale-slate/30 text-[44px]">
                  history_toggle_off
                </span>
                <p className="text-pale-slate/50 text-xs tracking-wide uppercase font-mono">
                  Sin registros aún
                </p>
              </div>
            ) : (
              <>
                <div className="relative max-h-[380px] overflow-y-auto pr-1">
                  {/* Línea vertical de la timeline */}
                  <div className="absolute left-[7px] top-2 bottom-2 w-px bg-white/8 rounded-full" />

                  <div className="flex flex-col gap-1">
                    {history.map((item: any, index: number) => {
                      const dt = new Date(item.executed_at)
                      const dateStr = dt.toLocaleDateString('es-MX', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })
                      const timeStr = dt.toLocaleTimeString('es-MX', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                      })
                      const isFirst = index === 0

                      return (
                        <div
                          key={item.id}
                          className="relative flex items-start gap-4 pl-6 py-2 group cursor-pointer rounded-lg hover:bg-white/3 transition-colors duration-150"
                          onClick={() => setCommand(item.command)}
                        >
                          {/* Nodo de la timeline */}
                          <div
                            className={`absolute left-0 top-3.5 flex items-center justify-center w-[15px] h-[15px] rounded-full border transition-all duration-300 shrink-0
                          ${
                            isFirst
                              ? 'bg-bright-snow/20 border-bright-snow/60 shadow-[0_0_8px_rgba(255,255,255,0.25)]'
                              : 'bg-carbon-black-500 border-white/15 group-hover:border-white/40 group-hover:bg-white/5'
                          }`}
                          >
                            <div
                              className={`w-[5px] h-[5px] rounded-full ${isFirst ? 'bg-bright-snow' : 'bg-white/30 group-hover:bg-white/60'} transition-colors`}
                            />
                          </div>

                          {/* Contenido */}
                          <div className="flex-1 min-w-0">
                            {/* Fecha + hora + entorno */}
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-[10px] font-mono text-pale-slate/50 tracking-wide">
                                {dateStr}
                              </span>
                              <span className="text-pale-slate/20 text-[10px]">·</span>
                              <span className="text-[10px] font-mono text-pale-slate/70 font-bold">
                                {timeStr}
                              </span>
                              <span className="text-pale-slate/20 text-[10px]">·</span>
                              <span
                                className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded font-mono
                              ${
                                item.enviroment === 'production'
                                  ? 'bg-white/5 text-pale-slate/50'
                                  : 'bg-emerald-950/50 text-emerald-500/70'
                              }`}
                              >
                                {item.enviroment}
                              </span>
                            </div>

                            {/* Comando en bloque de código */}
                            <div className="bg-carbon-black-100/60 border border-white/5 rounded-md px-3 py-2 group-hover:border-white/10 transition-colors">
                              <code className="text-[12px] font-mono text-bright-snow/90 leading-relaxed whitespace-pre-wrap break-all line-clamp-3">
                                <span className="text-pale-slate/40 select-none mr-1.5">$</span>
                                {item.command}
                              </code>
                            </div>
                          </div>

                          {/* Badge "Usar" */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 flex items-center gap-1 pt-1 text-pale-slate/50 hover:text-bright-snow">
                            <span className="material-symbols-outlined text-[16px]">
                              subdirectory_arrow_left
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                <small className="text-caption text-right"> {history.length} / 15 </small>
              </>
            )}
          </SettingsCard>
        </div>
      </div>

      {countdown !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-carbon-black-900/80 backdrop-blur-md">
          <div className="flex flex-col items-center justify-center gap-6 animate-in fade-in zoom-in duration-300">
            <div className="relative flex items-center justify-center w-48 h-48 rounded-full border-4 border-white/10 bg-carbon-black-500/50 shadow-[0_0_50px_rgba(255,255,255,0.1)]">
              <span className="text-7xl font-mono text-bright-snow font-bold animate-pulse">
                {countdown}
              </span>
              {/* Circular progress animation ring could go here */}
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="92"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  className="text-bright-snow opacity-20"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="92"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  className="text-bright-snow drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-1000 ease-linear"
                  strokeDasharray="578"
                  strokeDashoffset={578 - (578 * countdown) / (Number(manualDelay) || 1)}
                />
              </svg>
            </div>
            <div className="text-center">
              <h2 className="text-title-2 text-bright-snow tracking-wide mb-2">
                Preparando Ejecución
              </h2>
              <p className="text-body-md text-pale-slate">
                Por favor, cambia a la ventana de destino ahora.
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
