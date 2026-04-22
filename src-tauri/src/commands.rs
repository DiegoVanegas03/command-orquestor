use crate::db;
use enigo::{Direction, Enigo, Key, Keyboard, Settings};
use serde::{Deserialize, Serialize};
use std::thread;
use std::time::Duration;
use tauri::State;

#[derive(Serialize, Deserialize)]
pub struct WindowData {
    pub id: u32,
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
                title: w.title,
                app_name: w.info.name,
            });
        }
    }
    Ok(result)
}

fn focus_window_by_app(app_name: &str) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("osascript")
            .arg("-e")
            .arg(format!("tell application \"{}\" to activate", app_name))
            .output()
            .map_err(|e| e.to_string())?;
    }
    #[cfg(target_os = "windows")]
    {
        // En Windows, powershell o nircmd u otras utilidades.
        // Aquí una aproximación con powershell
        std::process::Command::new("powershell")
            .arg("-Command")
            .arg(format!(
                "(New-Object -ComObject WScript.Shell).AppActivate('{}')",
                app_name
            ))
            .output()
            .map_err(|e| e.to_string())?;
    }
    #[cfg(target_os = "linux")]
    {
        std::process::Command::new("wmctrl")
            .arg("-a")
            .arg(app_name)
            .output()
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub async fn execute_sequence(
    db_state: State<'_, db::Database>,
    command: String,
    speed: u64,
    enviroment: String,
    target_window: Option<String>,
) -> Result<String, String> {
    let mut enigo = Enigo::new(&Settings::default()).map_err(|e| e.to_string())?;

    // Si hay una ventana objetivo, la enfocamos primero
    if let Some(app_name) = target_window {
        focus_window_by_app(&app_name)?;
        // Pequeña pausa para asegurar que el OS haga el foco
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
