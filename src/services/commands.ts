import { invoke } from '@tauri-apps/api/core';

export interface CommandResponse {
  success: boolean;
  message: string;
}

export interface WindowData {
  id: number;
  title: string;
  app_name: string;
}

export const commandsService = {
  /**
   * Ejecuta una secuencia de comandos automatizada mediante simulación de teclado
   * @param command El comando o secuencia a ejecutar
   * @param speed La velocidad de escritura (ms por tecla)
   * @param enviroment Entorno de ejecución (ej. production, staging)
   * @param targetWindow (Opcional) El nombre de la aplicación donde enfocar
   */
  async executeSequence(command: string, speed: number, enviroment: string, targetWindow?: string): Promise<CommandResponse> {
    try {
      const result = await invoke<string>('execute_sequence', {
        command,
        speed,
        enviroment,
        targetWindow: targetWindow || null,
      });
      
      return { success: true, message: result };
    } catch (error) {
      console.error('Error al ejecutar la secuencia:', error);
      return { success: false, message: String(error) };
    }
  },

  /**
   * Obtiene el historial de comandos ejecutados
   */
  async getCommandHistory(): Promise<any[]> {
    try {
      return await invoke('get_commands');
    } catch (error) {
      console.error('Error al obtener el historial:', error);
      return [];
    }
  },

  /**
   * Obtiene la lista de ventanas activas abiertas en el sistema
   */
  async getOpenWindows(): Promise<WindowData[]> {
    try {
      return await invoke<WindowData[]>('get_open_windows');
    } catch (error) {
      console.error('Error al obtener ventanas abiertas:', error);
      return [];
    }
  }
};
