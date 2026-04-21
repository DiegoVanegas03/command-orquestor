import { createFileRoute } from '@tanstack/react-router'
import ToggleButtonGroup from '@/components/shared/ToggleButtonGroup'
import SpeedSlider from '@/components/shared/SpeedSlider'
import CommandInput from '@/components/CommandInput'
import ExecutionButton from '@/components/ExecutionButton'

import { useState } from 'react'

export const Route = createFileRoute('/')({
  component: Dashboard,
})

function Dashboard() {
  const [command, setCommand] = useState('')
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
        <div className="lg:col-span-8 flex flex-col h-[716px]">
          <div className="flex-1 flex flex-col bg-carbon-black-300/40 backdrop-blur-xl rounded-xl p-2 relative overflow-hidden ring-1 ring-white/10">
            {/* Terminal Header Bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-carbon-black-100/50 rounded-t-lg mb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-bright-snow text-sm">terminal</span>
                <span className="text-caption text-bright-snow font-bold uppercase tracking-widest">
                  Salida en Vivo
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
              onChange={setCommand}
              placeholder="Introduce el comando de ejecución..."
            />
          </div>
        </div>

        {/* Right Area: Parameters Panel (col-span-4) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-carbon-black-200/80 backdrop-blur-md rounded-xl p-6 ring-1 ring-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
            <h3 className="text-caption text-bright-snow font-bold uppercase tracking-wider mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">tune</span>
              Parámetros
            </h3>

            {/* Target Environment */}
            <div className="mb-8">
              <label className="block text-caption text-pale-slate uppercase tracking-wider mb-3">
                Nodo Objetivo
              </label>
              <ToggleButtonGroup
                options={[
                  { value: 'production', label: 'Producción', icon: 'public' },
                  { value: 'staging', label: 'Pruebas', icon: 'science' },
                ]}
                onChange={(val) => console.log('Ambiente seleccionado:', val)}
              />
            </div>

            <SpeedSlider onChange={(val) => console.log('Nueva velocidad:', val)} />
          </div>

          <ExecutionButton 
            onClick={() => console.log('Iniciando secuencia...')}
          />
        </div>
      </div>
    </main>
  )
}
