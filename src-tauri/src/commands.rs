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

#[tauri::command]
pub fn get_open_windows() -> Result<Vec<WindowData>, String> {
    let windows = x_win::get_open_windows().map_err(|e| e.to_string())?;
    map_x_win_results(windows)
}

/// Convierte los resultados de `x-win` al formato interno `WindowData`.
/// Usado en macOS, Windows y Linux X11/GNOME.
fn map_x_win_results(windows: Vec<x_win::WindowInfo>) -> Result<Vec<WindowData>, String> {
    let result = windows
        .into_iter()
        .filter(|w| !w.title.is_empty())
        .map(|w| WindowData {
            id: w.id,
            process_id: w.info.process_id,
            title: w.title,
            app_name: w.info.name,
        })
        .collect();
    Ok(result)
}

fn focus_window_by_pid(pid: u32) -> Result<(), String> {
    // ── macOS ──────────────────────────────────────────────────────────────
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

    // ── Windows ────────────────────────────────────────────────────────────
    #[cfg(target_os = "windows")]
    {
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

    // ── Linux (X11) ───────────────────────────────────────────────────────
    #[cfg(target_os = "linux")]
    {
        std::process::Command::new("xdotool")
            .args(["search", "--pid", &pid.to_string(), "windowfocus", "--sync"])
            .output()
            .map_err(|e| format!("xdotool error (¿instalado?): {}", e))?;
    }

    Ok(())
}

// ─────────────────────────────────────────────────────────────────────────────
// execute_sequence — Comando Tauri principal (sin cambios en lógica)
// ─────────────────────────────────────────────────────────────────────────────

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

#[tauri::command]
pub fn is_wayland() -> bool {
    #[cfg(target_os = "linux")]
    {
        if let Ok(session_type) = std::env::var("XDG_SESSION_TYPE") {
            if session_type.to_lowercase() == "wayland" {
                return true;
            }
        }
        if std::env::var("WAYLAND_DISPLAY").is_ok() {
            return true;
        }
    }
    false
}
