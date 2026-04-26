mod commands;
mod db;
use std::sync::Mutex;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .setup(|app| {
            let app_data_dir = app.path().app_data_dir().expect("failed to get app data dir");
            std::fs::create_dir_all(&app_data_dir).expect("failed to create app data dir");
            let db_path = app_data_dir.join("command_history.db");
            
            let conn = db::init_db(db_path).expect("Error al inicializar la base de datos");
            app.manage(db::Database {
                conn: Mutex::new(conn),
            });
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            commands::execute_sequence,
            commands::get_open_windows,
            commands::is_wayland,
            db::get_commands
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
