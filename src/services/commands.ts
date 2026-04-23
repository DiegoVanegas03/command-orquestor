import { invoke } from '@tauri-apps/api/core';
import { WindowData } from '@/components/WindowSelectionModalContent';

export interface CommandResponse {
  success: boolean;
  message: string;
}

export interface GnomeExtensionStatus {
  needs_extension: boolean;
  is_installed: boolean;
  is_enabled: boolean;
  message: string;
}

export interface GnomeSetupResult {
  success: boolean;
  next_step: 'RESTART_SESSION' | 'ENABLE_EXTENSION' | 'DONE' | 'ERROR';
  message: string;
}


export const commandsService = {
  /**
   * Ejecuta una secuencia de comandos automatizada mediante simulación de teclado
   * @param command El comando o secuencia a ejecutar
   * @param speed La velocidad de escritura (ms por tecla)
   * @param enviroment Entorno de ejecución (ej. production, staging)
   * @param targetPid (Opcional) PID del proceso donde enfocar antes de escribir
   */
  async executeSequence(command: string, speed: number, enviroment: string, targetPid?: number): Promise<CommandResponse> {
    try {
      const result = await invoke<string>('execute_sequence', {
        command,
        speed,
        enviroment,
        targetPid: targetPid ?? null,
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
  async getCommandHistory(limit?: number): Promise<any[]> {
    try {
      return await invoke('get_commands', { limit });
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
  },

  /**
   * Verifica el estado de la extensión de GNOME para Wayland
   */
  async checkGnomeExtension(): Promise<GnomeExtensionStatus> {
    try {
      return await invoke<GnomeExtensionStatus>('check_gnome_extension');
    } catch (error) {
      console.error('Error al verificar extensión GNOME:', error);
      return { 
        needs_extension: false, 
        is_installed: false, 
        is_enabled: false, 
        message: String(error) 
      };
    }
  },

  /**
   * Ejecuta el proceso de instalación/activación de la extensión GNOME
   */
  async setupGnomeExtension(): Promise<GnomeSetupResult> {
    try {
      return await invoke<GnomeSetupResult>('setup_gnome_extension');
    } catch (error) {
      console.error('Error al configurar extensión GNOME:', error);
      return { 
        success: false, 
        next_step: 'ERROR', 
        message: String(error) 
      };
    }
  }
};
