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

// ─────────────────────────────────────────────────────────────────────────────
// Helpers de detección de entorno Linux (solo compilan en Linux)
// ─────────────────────────────────────────────────────────────────────────────

/// Enum interno que representa el entorno gráfico detectado en Linux.
/// Solo existe en compilaciones Linux; en macOS/Windows no se genera código.
#[cfg(target_os = "linux")]
#[derive(Debug)]
enum LinuxDisplayEnv {
    /// X11 clásico (DISPLAY está definido, WAYLAND_DISPLAY no).
    X11,
    /// Wayland + GNOME Shell (XDG_CURRENT_DESKTOP contiene "GNOME").
    WaylandGnome,
    /// Wayland + KDE Plasma (XDG_CURRENT_DESKTOP contiene "KDE").
    WaylandKde,
    /// Wayland + Sway (SWAYSOCK está definido o $DESKTOP_SESSION == "sway").
    WaylandSway,
    /// Wayland + Hyprland (HYPRLAND_INSTANCE_SIGNATURE está definido).
    WaylandHyprland,
    /// Wayland genérico (compositor desconocido).
    WaylandUnknown,
}

/// Detecta el entorno gráfico activo en Linux leyendo variables de entorno.
/// Esta función solo existe en compilaciones Linux.
#[cfg(target_os = "linux")]
fn detect_linux_env() -> LinuxDisplayEnv {
    let is_wayland = std::env::var("WAYLAND_DISPLAY").is_ok();

    if !is_wayland {
        return LinuxDisplayEnv::X11;
    }

    // En Wayland, identificamos el compositor/DE
    let desktop = std::env::var("XDG_CURRENT_DESKTOP")
        .unwrap_or_default()
        .to_uppercase();

    if desktop.contains("GNOME") || desktop.contains("UNITY") {
        return LinuxDisplayEnv::WaylandGnome;
    }
    if desktop.contains("KDE") {
        return LinuxDisplayEnv::WaylandKde;
    }

    // Detección por socket/variable específica del compositor
    if std::env::var("HYPRLAND_INSTANCE_SIGNATURE").is_ok() {
        return LinuxDisplayEnv::WaylandHyprland;
    }
    if std::env::var("SWAYSOCK").is_ok()
        || std::env::var("DESKTOP_SESSION")
            .unwrap_or_default()
            .to_lowercase()
            == "sway"
    {
        return LinuxDisplayEnv::WaylandSway;
    }

    LinuxDisplayEnv::WaylandUnknown
}

// ─────────────────────────────────────────────────────────────────────────────
// get_open_windows — Comando Tauri (cross-platform)
// ─────────────────────────────────────────────────────────────────────────────

/// Obtiene la lista de ventanas activas del sistema operativo.
///
/// **Notas sobre Permisos del Sistema Operativo:**
/// - **macOS:** A partir de macOS Catalina (10.15), requiere permisos de
///   "Grabación de Pantalla" en Privacidad y Seguridad. Sin ellos solo
///   devuelve las ventanas de la propia app.
/// - **Windows:** No requiere permisos especiales.
/// - **Linux X11:** Funciona sin permisos extra mediante `x-win`.
/// - **Linux Wayland + GNOME:** Requiere la extensión `x-win@miniben90.org`
///   (instalable con `x_win::install_extension()`).
/// - **Linux Wayland + KDE:** Usa `qdbus` para consultar KWin via D-Bus.
/// - **Linux Wayland + Sway:** Usa `swaymsg -t get_tree` para listar clientes.
/// - **Linux Wayland + Hyprland:** Usa `hyprctl clients` para listar clientes.
/// - **Linux Wayland (desconocido):** Devuelve error descriptivo.
#[tauri::command]
pub fn get_open_windows() -> Result<Vec<WindowData>, String> {
    // ── macOS y Windows: delegan en x-win sin cambios ──────────────────────
    #[cfg(not(target_os = "linux"))]
    {
        let windows = x_win::get_open_windows().map_err(|e| e.to_string())?;
        return map_x_win_results(windows);
    }

    // ── Linux: detección de entorno y backend apropiado ────────────────────
    #[cfg(target_os = "linux")]
    {
        match detect_linux_env() {
            // X11: x-win funciona sin restricciones
            LinuxDisplayEnv::X11 => {
                let windows = x_win::get_open_windows().map_err(|e| e.to_string())?;
                map_x_win_results(windows)
            }

            // Wayland + GNOME: necesita la extensión x-win@miniben90.org
            LinuxDisplayEnv::WaylandGnome => {
                // Verificamos primero si la extensión está lista
                let installed = x_win::is_installed_extension().unwrap_or(false);
                let enabled   = x_win::is_enabled_extension().unwrap_or(false);

                if !installed {
                    // Prefijo reconocible para que el frontend muestre el onboarding
                    return Err("GNOME_EXT_NOT_INSTALLED".to_string());
                }
                if !enabled {
                    return Err("GNOME_EXT_NOT_ENABLED".to_string());
                }

                // Extensión lista → obtenemos ventanas normalmente
                let windows = x_win::get_open_windows().map_err(|e| e.to_string())?;
                map_x_win_results(windows)
            }

            // KDE Plasma: consulta KWin via D-Bus con qdbus
            LinuxDisplayEnv::WaylandKde => get_windows_kde(),

            // Sway: parsea la salida de swaymsg
            LinuxDisplayEnv::WaylandSway => get_windows_sway(),

            // Hyprland: parsea la salida de hyprctl
            LinuxDisplayEnv::WaylandHyprland => get_windows_hyprland(),

            // Compositor desconocido
            LinuxDisplayEnv::WaylandUnknown => Err(
                "Wayland detectado pero compositor no soportado. \
                 Entornos soportados: X11, GNOME, KDE Plasma, Sway, Hyprland."
                    .to_string(),
            ),
        }
    }
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

// ─────────────────────────────────────────────────────────────────────────────
// Backends Wayland por compositor (solo compilan en Linux)
// ─────────────────────────────────────────────────────────────────────────────

/// Obtiene ventanas en KDE Plasma (Wayland) usando `qdbus` para consultar KWin.
///
/// KWin expone información de ventanas a través de su interfaz D-Bus.
/// `qdbus org.kde.KWin /KWin org.kde.KWin.getWindowList` devuelve IDs de ventana,
/// y luego se consulta cada una para obtener título, PID y nombre de app.
#[cfg(target_os = "linux")]
fn get_windows_kde() -> Result<Vec<WindowData>, String> {
    // 1. Obtener lista de IDs de ventana
    let output = std::process::Command::new("qdbus")
        .args(["org.kde.KWin", "/KWin", "org.kde.KWin.getWindowList"])
        .output()
        .map_err(|e| format!("KDE: qdbus no disponible (¿instalado?): {}", e))?;

    if !output.status.success() {
        return Err(format!(
            "KDE: qdbus error: {}",
            String::from_utf8_lossy(&output.stderr)
        ));
    }

    let ids_raw = String::from_utf8_lossy(&output.stdout);
    let mut result = Vec::new();

    for id_str in ids_raw.lines() {
        let id_str = id_str.trim();
        if id_str.is_empty() {
            continue;
        }

        // 2. Obtener caption (título) de cada ventana
        let caption = query_kwin_window_prop(id_str, "caption").unwrap_or_default();
        if caption.is_empty() {
            continue;
        }

        // 3. Obtener PID y nombre de aplicación
        let pid_str = query_kwin_window_prop(id_str, "pid").unwrap_or_default();
        let pid: u32 = pid_str.trim().parse().unwrap_or(0);
        let app_name = query_kwin_window_prop(id_str, "resourceClass").unwrap_or_default();

        // Generamos un ID numérico aproximado desde el hash del id_str
        let win_id = id_str
            .trim_start_matches("0x")
            .parse::<u32>()
            .unwrap_or(0);

        result.push(WindowData {
            id: win_id,
            process_id: pid,
            title: caption.trim().to_string(),
            app_name: app_name.trim().to_string(),
        });
    }

    Ok(result)
}

/// Consulta una propiedad de una ventana de KWin via D-Bus.
#[cfg(target_os = "linux")]
fn query_kwin_window_prop(window_id: &str, prop: &str) -> Option<String> {
    let interface = format!("org.kde.KWin.Window.{}", prop);
    let path = format!("/org/kde/KWin/Window/{}", window_id.trim_start_matches("0x"));
    let output = std::process::Command::new("qdbus")
        .args(["org.kde.KWin", &path, &interface])
        .output()
        .ok()?;
    if output.status.success() {
        Some(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        None
    }
}

/// Obtiene ventanas en Sway (Wayland) parseando `swaymsg -t get_tree`.
///
/// Sway expone un árbol de nodos JSON. Navegamos recursivamente buscando
/// nodos de tipo "con" que tengan nombre (título de ventana) y PID.
#[cfg(target_os = "linux")]
fn get_windows_sway() -> Result<Vec<WindowData>, String> {
    let output = std::process::Command::new("swaymsg")
        .args(["-t", "get_tree"])
        .output()
        .map_err(|e| format!("Sway: swaymsg no disponible (¿instalado?): {}", e))?;

    if !output.status.success() {
        return Err(format!(
            "Sway: swaymsg error: {}",
            String::from_utf8_lossy(&output.stderr)
        ));
    }

    let json_str = String::from_utf8_lossy(&output.stdout);
    let tree: serde_json::Value = serde_json::from_str(&json_str)
        .map_err(|e| format!("Sway: JSON inválido: {}", e))?;

    let mut result = Vec::new();
    collect_sway_windows(&tree, &mut result);
    Ok(result)
}

/// Recorre recursivamente el árbol de nodos de Sway y extrae ventanas con título.
#[cfg(target_os = "linux")]
fn collect_sway_windows(node: &serde_json::Value, out: &mut Vec<WindowData>) {
    // Un nodo con "pid" y "name" no vacío es una ventana de aplicación
    if let (Some(pid_val), Some(name_val)) = (node.get("pid"), node.get("name")) {
        if let (Some(pid), Some(name)) = (pid_val.as_u64(), name_val.as_str()) {
            if !name.is_empty() && name != "null" {
                let id = node
                    .get("id")
                    .and_then(|v| v.as_u64())
                    .unwrap_or(0) as u32;
                let app_id = node
                    .get("app_id")
                    .and_then(|v| v.as_str())
                    .unwrap_or("")
                    .to_string();
                out.push(WindowData {
                    id,
                    process_id: pid as u32,
                    title: name.to_string(),
                    app_name: app_id,
                });
            }
        }
    }

    // Recursar en nodos hijos (nodes y floating_nodes)
    for key in &["nodes", "floating_nodes"] {
        if let Some(children) = node.get(key).and_then(|v| v.as_array()) {
            for child in children {
                collect_sway_windows(child, out);
            }
        }
    }
}

/// Obtiene ventanas en Hyprland (Wayland) parseando `hyprctl clients -j`.
///
/// Hyprland expone una lista de clientes en JSON con título, PID y clase de app.
#[cfg(target_os = "linux")]
fn get_windows_hyprland() -> Result<Vec<WindowData>, String> {
    let output = std::process::Command::new("hyprctl")
        .args(["clients", "-j"])
        .output()
        .map_err(|e| format!("Hyprland: hyprctl no disponible (¿instalado?): {}", e))?;

    if !output.status.success() {
        return Err(format!(
            "Hyprland: hyprctl error: {}",
            String::from_utf8_lossy(&output.stderr)
        ));
    }

    let json_str = String::from_utf8_lossy(&output.stdout);
    let clients: serde_json::Value = serde_json::from_str(&json_str)
        .map_err(|e| format!("Hyprland: JSON inválido: {}", e))?;

    let mut result = Vec::new();
    if let Some(arr) = clients.as_array() {
        for client in arr {
            let title = client
                .get("title")
                .and_then(|v| v.as_str())
                .unwrap_or("")
                .to_string();
            if title.is_empty() {
                continue;
            }
            let pid = client
                .get("pid")
                .and_then(|v| v.as_u64())
                .unwrap_or(0) as u32;
            let app_name = client
                .get("class")
                .and_then(|v| v.as_str())
                .unwrap_or("")
                .to_string();
            // Hyprland usa address hex como ID de ventana
            let id_str = client
                .get("address")
                .and_then(|v| v.as_str())
                .unwrap_or("0x0");
            let id = u32::from_str_radix(id_str.trim_start_matches("0x"), 16).unwrap_or(0);

            result.push(WindowData {
                id,
                process_id: pid,
                title,
                app_name,
            });
        }
    }

    Ok(result)
}

// ─────────────────────────────────────────────────────────────────────────────
// focus_window_by_pid — Comando interno (cross-platform)
// ─────────────────────────────────────────────────────────────────────────────

/// Enfoca una ventana del sistema operativo utilizando su PID (Process ID).
///
/// Usar el PID es más preciso que el nombre de app: evita colisiones con
/// procesos que comparten nombre y permite identificar instancias específicas.
///
/// - **macOS:** usa AppleScript a través de `System Events`.
/// - **Windows:** usa PowerShell con `SetForegroundWindow`.
/// - **Linux X11:** usa `xdotool` (sin cambios).
/// - **Linux Wayland + GNOME:** usa `xdotool` via XWayland (si disponible).
/// - **Linux Wayland + KDE:** usa `kdotool windowactivate`.
/// - **Linux Wayland + Sway:** usa `swaymsg '[pid=X] focus'`.
/// - **Linux Wayland + Hyprland:** usa `hyprctl dispatch focuswindow pid:X`.
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

    // ── Linux: detección de entorno y herramienta apropiada ───────────────
    #[cfg(target_os = "linux")]
    {
        match detect_linux_env() {
            // X11 o GNOME Wayland (via XWayland): xdotool funciona
            LinuxDisplayEnv::X11 | LinuxDisplayEnv::WaylandGnome => {
                std::process::Command::new("xdotool")
                    .args(["search", "--pid", &pid.to_string(), "windowfocus", "--sync"])
                    .output()
                    .map_err(|e| format!("xdotool error (¿instalado?): {}", e))?;
            }

            // KDE Plasma: kdotool windowactivate --pid <PID>
            LinuxDisplayEnv::WaylandKde => {
                let output = std::process::Command::new("kdotool")
                    .args(["search", "--pid", &pid.to_string()])
                    .output()
                    .map_err(|e| format!("KDE: kdotool no disponible (¿instalado?): {}", e))?;

                let win_id = String::from_utf8_lossy(&output.stdout)
                    .lines()
                    .next()
                    .unwrap_or("")
                    .trim()
                    .to_string();

                if !win_id.is_empty() {
                    std::process::Command::new("kdotool")
                        .args(["windowactivate", &win_id])
                        .output()
                        .map_err(|e| format!("KDE: kdotool windowactivate error: {}", e))?;
                }
            }

            // Sway: swaymsg '[pid=X] focus'
            LinuxDisplayEnv::WaylandSway => {
                std::process::Command::new("swaymsg")
                    .arg(format!("[pid={}] focus", pid))
                    .output()
                    .map_err(|e| format!("Sway: swaymsg error (¿instalado?): {}", e))?;
            }

            // Hyprland: hyprctl dispatch focuswindow pid:X
            LinuxDisplayEnv::WaylandHyprland => {
                std::process::Command::new("hyprctl")
                    .args(["dispatch", "focuswindow", &format!("pid:{}", pid)])
                    .output()
                    .map_err(|e| format!("Hyprland: hyprctl error (¿instalado?): {}", e))?;
            }

            // Compositor Wayland desconocido
            LinuxDisplayEnv::WaylandUnknown => {
                return Err(format!(
                    "No se puede enfocar la ventana PID {}: compositor Wayland no soportado. \
                     Soportados: X11, GNOME, KDE Plasma, Sway, Hyprland.",
                    pid
                ));
            }
        }
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

// ─────────────────────────────────────────────────────────────────────────────
// Diagnóstico y setup de la extensión GNOME (solo relevante en Linux)
// ─────────────────────────────────────────────────────────────────────────────

/// Estado de la extensión GNOME requerida en Wayland + GNOME.
#[derive(Serialize)]
pub struct GnomeExtensionStatus {
    /// El sistema está corriendo Wayland + GNOME (la extensión es necesaria).
    pub needs_extension: bool,
    /// Los archivos de la extensión ya están copiados al sistema.
    pub is_installed: bool,
    /// La extensión está activa en GNOME Shell.
    pub is_enabled: bool,
    /// Mensaje descriptivo del estado actual.
    pub message: String,
}

/// Consulta el estado de la extensión x-win para GNOME Wayland.
///
/// El frontend debe llamar a este comando al iniciar para saber si debe
/// mostrar un banner de onboarding al usuario.
///
/// **Posibles estados devueltos:**
/// - `needs_extension: false` → No es GNOME Wayland, no hace falta nada.
/// - `is_installed: false`    → Hay que instalar (llamar a `setup_gnome_extension`).
/// - `is_enabled: false`      → Instalada pero requiere reinicio de sesión + activación.
/// - Todo `true`              → Extensión operativa, no mostrar nada.
#[tauri::command]
pub fn check_gnome_extension() -> GnomeExtensionStatus {
    #[cfg(not(target_os = "linux"))]
    {
        // En macOS/Windows nunca hace falta la extensión
        return GnomeExtensionStatus {
            needs_extension: false,
            is_installed: false,
            is_enabled: false,
            message: "No aplica en este sistema operativo.".to_string(),
        };
    }

    #[cfg(target_os = "linux")]
    {
        if !matches!(detect_linux_env(), LinuxDisplayEnv::WaylandGnome) {
            return GnomeExtensionStatus {
                needs_extension: false,
                is_installed: false,
                is_enabled: false,
                message: "No es Wayland + GNOME; la extensión no es necesaria.".to_string(),
            };
        }

        let installed = x_win::is_installed_extension().unwrap_or(false);
        let enabled   = x_win::is_enabled_extension().unwrap_or(false);

        let message = match (installed, enabled) {
            (false, _) => {
                "La extensión x-win no está instalada. Haz clic en 'Instalar extensión' \
                 para continuar."
                    .to_string()
            }
            (true, false) => {
                "Extensión instalada. Necesitas cerrar sesión y volver a iniciarla para \
                 que GNOME Shell la cargue. Después, haz clic en 'Activar extensión'."
                    .to_string()
            }
            (true, true) => "Extensión operativa. Todo listo.".to_string(),
        };

        GnomeExtensionStatus {
            needs_extension: true,
            is_installed: installed,
            is_enabled: enabled,
            message,
        }
    }
}

/// Resultado de intentar instalar/activar la extensión GNOME.
#[derive(Serialize)]
pub struct GnomeSetupResult {
    /// Si el paso actual se completó sin errores.
    pub success: bool,
    /// Siguiente acción que debe realizar el usuario o la app.
    /// Valores posibles: "RESTART_SESSION" | "ENABLE_EXTENSION" | "DONE" | "ERROR"
    pub next_step: String,
    /// Mensaje descriptivo para mostrar al usuario.
    pub message: String,
}

/// Intenta instalar y/o habilitar la extensión x-win en GNOME Wayland.
///
/// **Flujo automático:**
/// 1. Si la extensión no está instalada: copia los archivos automáticamente
///    y devuelve `next_step: "RESTART_SESSION"` — el usuario DEBE reiniciar
///    su sesión de GNOME (logout + login) para que Shell la cargue.
/// 2. Si ya está instalada pero no habilitada: la habilita automáticamente
///    y devuelve `next_step: "DONE"`.
/// 3. Si ya está instalada y habilitada: devuelve `next_step: "DONE"`.
///
/// El frontend debe observar `next_step` para guiar al usuario paso a paso.
#[tauri::command]
pub fn setup_gnome_extension() -> GnomeSetupResult {
    #[cfg(not(target_os = "linux"))]
    {
        return GnomeSetupResult {
            success: false,
            next_step: "ERROR".to_string(),
            message: "Este comando solo aplica en Linux con GNOME Wayland.".to_string(),
        };
    }

    #[cfg(target_os = "linux")]
    {
        if !matches!(detect_linux_env(), LinuxDisplayEnv::WaylandGnome) {
            return GnomeSetupResult {
                success: false,
                next_step: "ERROR".to_string(),
                message: "El entorno detectado no es GNOME Wayland.".to_string(),
            };
        }

        let installed = x_win::is_installed_extension().unwrap_or(false);
        let enabled   = x_win::is_enabled_extension().unwrap_or(false);

        // Paso 1: instalar archivos si no están
        if !installed {
            if let Err(e) = x_win::install_extension() {
                return GnomeSetupResult {
                    success: false,
                    next_step: "ERROR".to_string(),
                    message: format!(
                        "No se pudieron copiar los archivos de la extensión: {}. \
                         Verifica que tienes permisos de escritura en ~/.local/share/gnome-shell/extensions/",
                        e
                    ),
                };
            }
            // Los archivos se copiaron: el usuario DEBE reiniciar sesión
            return GnomeSetupResult {
                success: true,
                next_step: "RESTART_SESSION".to_string(),
                message: "Extensión instalada correctamente. Para que GNOME Shell la cargue, \
                           cierra tu sesión (logout) y vuelve a iniciarla. \
                           Después regresa aquí y haz clic en 'Activar extensión'."
                    .to_string(),
            };
        }

        // Paso 2: habilitar si ya está instalada pero no activa
        if !enabled {
            if let Err(e) = x_win::enable_extension() {
                return GnomeSetupResult {
                    success: false,
                    next_step: "ERROR".to_string(),
                    message: format!(
                        "No se pudo activar la extensión automáticamente: {}. \
                         Actívala manualmente desde la app 'Extensiones' de GNOME.",
                        e
                    ),
                };
            }
            return GnomeSetupResult {
                success: true,
                next_step: "DONE".to_string(),
                message: "Extensión activada. Ya puedes listar ventanas en Wayland + GNOME."
                    .to_string(),
            };
        }

        // Todo ya estaba listo
        GnomeSetupResult {
            success: true,
            next_step: "DONE".to_string(),
            message: "La extensión ya estaba instalada y activa.".to_string(),
        }
    }
}
