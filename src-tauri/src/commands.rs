use crate::db;
use enigo::{Direction, Enigo, Key, Keyboard, Settings};
use serde::{Deserialize, Serialize};
use std::thread;
use std::time::Duration;
use tauri::State;

#[derive(Serialize, Deserialize)]
pub struct WindowData {
    pub id: u32,         // CGWindowID / Window handle (identificador de ventana)
    pub process_id: u32, // PID real del proceso (unix id)
    pub title: String,
    pub app_name: String,
}

/// Obtiene la lista de ventanas activas del sistema operativo.
/// 
/// **Notas sobre Permisos del Sistema Operativo:**
/// - **macOS:** A partir de macOS Catalina (10.15), para listar ventanas de *otras* aplicaciones, 
///   la aplicación (o terminal ejecutando el entorno de desarrollo) requiere permisos de 
///   "Grabación de Pantalla" (Screen Recording) y opcionalmente "Accesibilidad" en las preferencias 
///   de Privacidad y Seguridad. Si no se otorgan, solo devolverá las ventanas de la propia app.
/// - **Windows:** No requiere permisos especiales.
/// - **Linux:** Generalmente funciona sin permisos extra en X11, pero en Wayland podría 
///   estar más restringido por la seguridad del protocolo.
#[tauri::command]
pub fn get_open_windows() -> Result<Vec<WindowData>, String> {
    let windows = x_win::get_open_windows().map_err(|e| e.to_string())?;

    let mut result = Vec::new();
    for w in windows {
        if !w.title.is_empty() {
            result.push(WindowData {
                id: w.id,
                process_id: w.info.process_id,
                title: w.title,
                app_name: w.info.name,
            });
        }
    }
    Ok(result)
}

/// Enfoca una ventana del sistema operativo utilizando su PID (Process ID).
///
/// Usar el PID es más preciso que el nombre de app: evita colisiones con
/// procesos que comparten nombre y permite identificar instancias específicas.
///
/// - **macOS:** usa AppleScript a través de `System Events` para buscar el
///   proceso cuyo `unix id` coincida con el PID y llevarlo al frente.
/// - **Windows:** usa PowerShell para traer al frente el proceso por su ID.
/// - **Linux (X11):** usa `xdotool` para buscar ventanas del PID y hacer foco.
fn focus_window_by_pid(pid: u32) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        let script = format!(
            "tell application \"System Events\"\n\
               set target_proc to first process whose unix id is {}\n\
               set frontmost of target_proc to true\n\
             end tell",
            pid
        );
        let output = std::process::Command::new("osascript")
            .arg("-e")
            .arg(&script)
            .output()
            .map_err(|e| e.to_string())?;

        if !output.status.success() {
            let err = String::from_utf8_lossy(&output.stderr);
            return Err(format!("osascript error: {}", err));
        }
    }
    #[cfg(target_os = "windows")]
    {
        // Obtener el HWND del proceso por PID y llevarlo al frente via PowerShell
        let script = format!(
            "Add-Type @'\n\
             using System;\n\
             using System.Runtime.InteropServices;\n\
             public class Win32 {{\n\
               [DllImport(\"user32.dll\")] public static extern bool SetForegroundWindow(IntPtr hWnd);\n\
               [DllImport(\"user32.dll\")] public static extern IntPtr GetForegroundWindow();\n\
             }}\n\
             '@\n\
             $proc = Get-Process -Id {0} -ErrorAction SilentlyContinue\n\
             if ($proc) {{ [Win32]::SetForegroundWindow($proc.MainWindowHandle) }}",
            pid
        );
        std::process::Command::new("powershell")
            .args(["-NoProfile", "-Command", &script])
            .output()
            .map_err(|e| e.to_string())?;
    }
    #[cfg(target_os = "linux")]
    {
        // xdotool busca todas las ventanas del PID y activa la primera
        std::process::Command::new("xdotool")
            .args(["search", "--pid", &pid.to_string(), "windowfocus", "--sync"])
            .output()
            .map_err(|e| format!("xdotool error (¿instalado?): {}", e))?;
    }
    Ok(())
}

#[tauri::command]
pub async fn execute_sequence(
    db_state: State<'_, db::Database>,
    command: String,
    speed: u64,
    enviroment: String,
    // PID del proceso destino. None = sin foco (sandbox o no configurado).
    target_pid: Option<u32>,
) -> Result<String, String> {
    let mut enigo = Enigo::new(&Settings::default()).map_err(|e| e.to_string())?;

    // Si hay un PID objetivo, enfocamos la ventana antes de escribir
    if let Some(pid) = target_pid {
        focus_window_by_pid(pid)?;
        // Pausa para que el OS complete el cambio de foco
        thread::sleep(Duration::from_millis(500));
    }

    // Sanitización: separamos los comandos por saltos de línea y por '&&'
    let sanitized_commands: Vec<String> = command
        .split('\n')
        .flat_map(|s| s.split("&&"))
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty())
        .collect();

    for cmd in &sanitized_commands {
        // Guardamos el comando en la BD
        {
            let conn = db_state.conn.lock().unwrap();
            db::save_command_internal(&conn, cmd, &enviroment).map_err(|e| e.to_string())?;
        }

        // Iteramos por cada caracter para simular escritura humana
        for c in cmd.chars() {
            let _ = enigo.text(&c.to_string());
            thread::sleep(Duration::from_millis(speed));
        }

        // Ejecutamos cada comando con Enter
        let _ = enigo.key(Key::Return, Direction::Click);

        // Pequeña pausa entre comandos
        thread::sleep(Duration::from_millis(100));
    }

    Ok(format!(
        "Secuencia completada con {} comandos.",
        sanitized_commands.len()
    ))
}
