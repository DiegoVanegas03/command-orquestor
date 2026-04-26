import { invoke } from '@tauri-apps/api/core'
import { WindowData } from '@/components/WindowSelectionModalContent'

export interface CommandRecord {
  id: number
  command: string
  enviroment: string
  executed_at: string
}

export interface CommandResponse {
  success: boolean
  message: string
}

export const commandsService = {
  /**
   * Ejecuta una secuencia de comandos automatizada mediante simulación de teclado
   * @param command El comando o secuencia a ejecutar
   * @param speed La velocidad de escritura (ms por tecla)
   * @param enviroment Entorno de ejecución (ej. production, staging)
   * @param targetPid (Opcional) PID del proceso donde enfocar antes de escribir
   */
  async executeSequence(
    command: string,
    speed: number,
    enviroment: string,
    targetPid?: number,
    enableEnter: boolean = true,
  ): Promise<CommandResponse> {
    try {
      const result = await invoke<string>('execute_sequence', {
        command,
        speed,
        enviroment,
        targetPid: targetPid ?? null,
        enableEnter,
      })

      return { success: true, message: result }
    } catch (error) {
      console.error('Error al ejecutar la secuencia:', error)
      return { success: false, message: String(error) }
    }
  },

  /**
   * Obtiene el historial de comandos ejecutados
   */
  async getCommandHistory(limit?: number): Promise<CommandRecord[]> {
    try {
      return await invoke('get_commands', { limit })
    } catch (error) {
      console.error('Error al obtener el historial:', error)
      return []
    }
  },

  /**
   * Obtiene la lista de ventanas activas abiertas en el sistema
   */
  async getOpenWindows(): Promise<WindowData[]> {
    try {
      return await invoke<WindowData[]>('get_open_windows')
    } catch (error) {
      console.error('Error al obtener ventanas abiertas:', error)
      return []
    }
  },
}
