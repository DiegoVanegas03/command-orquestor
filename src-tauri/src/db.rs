use rusqlite::{Connection, Result};
use std::sync::Mutex;
use tauri::State;
use serde::Serialize;

pub struct Database {
    pub conn: Mutex<Connection>,
}

#[derive(Serialize)]
pub struct CommandRecord {
    id: i32,
    command: String,
    enviroment: String,
    executed_at: String,
}

pub fn init_db() -> Result<Connection> {
    let conn = Connection::open("command_history.db")?;
    
    conn.execute(
        "CREATE TABLE IF NOT EXISTS commands (
            id INTEGER PRIMARY KEY,
            command TEXT NOT NULL,
            enviroment TEXT NOT NULL,
            executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )?;
    
    Ok(conn)
}

pub fn save_command_internal(conn: &Connection, command: &str, enviroment: &str) -> Result<(), rusqlite::Error> {
    conn.execute(
        "INSERT INTO commands (command, enviroment) VALUES (?1, ?2)",
        rusqlite::params![command, enviroment],
    )?;
    Ok(())
}

#[tauri::command]
pub fn get_commands(db: State<'_, Database>, limit: Option<u32>) -> Result<Vec<CommandRecord>, String> {
    let conn = db.conn.lock().unwrap();
    let limit_val = limit.unwrap_or(50);
    let mut stmt = conn.prepare("SELECT id, command, enviroment, executed_at FROM commands ORDER BY executed_at DESC LIMIT ?1").map_err(|e| e.to_string())?;
    
    let command_iter = stmt.query_map([limit_val], |row| {
        Ok(CommandRecord {
            id: row.get(0)?,
            command: row.get(1)?,
            enviroment: row.get(2)?,
            executed_at: row.get(3)?,
        })
    }).map_err(|e| e.to_string())?;
    
    let mut commands = Vec::new();
    for command in command_iter {
        commands.push(command.map_err(|e| e.to_string())?);
    }
    
    Ok(commands)
}
