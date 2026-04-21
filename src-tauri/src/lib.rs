mod commands;
mod db;
use std::sync::Mutex;


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let conn = db::init_db().expect("Error al inicializar la base de datos");

    tauri::Builder::default()
        .manage(db::Database {
            conn: Mutex::new(conn),
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            commands::execute_sequence, 
            commands::get_open_windows,
            db::get_commands
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
