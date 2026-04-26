import { createRootRoute, Outlet } from '@tanstack/react-router'
import Sidebar from '@/components/Sidebar'
import TopNavBar from '@/components/TopNavBar'
import { Modal } from '@/components/shared/Modal'
import { useEffect } from 'react'
import { useConfigStore } from '@/stores/useConfigStore'
import { useConsoleStore } from '@/stores/useConsoleStore'
import { getCurrentWindow } from '@tauri-apps/api/window'

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: () => <div>404</div>,
})


function RootComponent() {
  const loadConfig = useConfigStore((state) => state.loadConfig)
  const log = useConsoleStore((state) => state.log)

  useEffect(() => {
    log('sys', 'Inicializando entorno de ejecución Orquestor...')
    log('sys', 'Cargando configuración desde el almacén persistente.')

    loadConfig().then(() => {
      log('ok', '→ Configuración cargada correctamente.')
      log('ok', '→ Asignando contexto de ejecución... OK')
      log('exec', 'Listo para la secuencia de comandos.')
      log('info', 'Esperando entrada del usuario...')
    }).catch(() => {
      log('warn', '→ No se pudo cargar la configuración guardada. Usando valores por defecto.')
      log('exec', 'Listo para la secuencia de comandos.')
    })

    // Listen to window close request
    let unlisten: (() => void) | null = null
    getCurrentWindow()
      .onCloseRequested(async (event) => {
        event.preventDefault()
        // 1. Guardar el estado
        await useConfigStore.getState().saveToRust()
        // 2. Dejar de escuchar el evento para no caer en bucle
        if (unlisten) unlisten()
        // 3. Cerrar la ventana nativamente
        await getCurrentWindow().close()
      })
      .then((fn) => {
        unlisten = fn
      })

    return () => {
      if (unlisten) unlisten()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="bg-carbon-black-500 text-bright-snow font-roboto antialiased h-screen overflow-hidden flex selection:bg-carbon-black-700 selection:text-bright-snow">

      {/* SideNavBar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full pl-0 xl:pl-64 transition-all duration-300">
        {/* TopNavBar */}
        <TopNavBar />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto pt-4 relative">
          <Outlet />
        </main>
      </div>

      {/* Global Modal */}
      <Modal />
    </div>
  )
}
