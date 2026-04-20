# CommandOrquestor

Aplicación de escritorio construida con Tauri, Rust y SQLite diseñada para automatizar la escritura de comandos en interfaces que no permiten copiar/pegar (como consolas web tipo Proxmox), integrando historial, ejecución diferida y control de ventana destino y flows de comandos.

---

# Problemática

En entornos como consolas web (Proxmox, VNC, noVNC, etc.), existen limitaciones críticas:

- No se puede copiar/pegar correctamente
- Se corrompen caracteres especiales (`'`, `"`, `$`, `\`)
- Input no confiable (traducción de teclado vía navegador)
- Errores humanos al escribir comandos largos
- Dificultad para repetir comandos complejos

Esto vuelve tareas simples (como instalar servicios o ejecutar scripts) en procesos lentos, propensos a errores y frustrantes.

---

# Solución

Esta aplicación actúa como un orquestador de comandos automatizado, permitiendo:

- Simular escritura humana controlada
- Ejecutar comandos con delay programado
- Reutilizar comandos mediante historial
- Seleccionar la ventana destino
- Evitar errores de input en consolas web
- Crear flows de comandos

En lugar de copiar/pegar, el sistema escribe por el usuario como si fuera entrada manual, pero sin errores.

---

# Funcionalidades

## Historial de comandos

- Almacenamiento persistente usando SQLite
- Reutilización rápida de comandos previos
- Posibilidad de extender a favoritos, etiquetas y agrupación

---

## Escritura automática

- Simulación de teclado carácter por carácter
- Configuración de velocidad mediante delay
- Compatible con entornos donde el pegado falla

---

## Ejecución con retardo

- Configuración de tiempo de espera antes de ejecutar
- Permite cambiar manualmente a la ventana destino

---

## Envío automático

- Simulación de tecla Enter tras escribir el comando
- Flujo completamente automatizado

---

## Selección de ventana destino

- Permite elegir en qué ventana se ejecutará el comando
- Basado en enfoque o selección de ventana activa
- Posible integración con identificadores de ventana del sistema

---

## Flows de comandos

- Secuencias de comandos que se ejecutan en orden
- Permite crear flujos complejos de comandos
- Posibilidad de guardar flows para reutilización

## Ejecución controlada

- Reduce errores humanos en escritura manual
- Ideal para comandos largos o sensibles

---

# Arquitectura

## Enfoque: Arquitectura por Ficheros

### React

```bash
src/
├── components/
├── hooks/
├── pages/
├── routes/
├── store/
├── assets/
├── App.tsx
├── main.tsx
```

- **React Hooks**: Se utilizarán custom hooks para aislar y reutilizar la lógica de estado y efectos.
- **TanStack Router**: Sistema de enrutamiento Type-Safe para la navegación de la aplicación.

### Rust

Dado que es un proyecto pequeño, se opta por una estructura simple basada en separación por archivos:

```bash
src/
├── main.rs
├── commands.rs
├── db.rs
├── automation.rs
├── window.rs
```

Descripción:

- main.rs: punto de entrada de Tauri
- commands.rs: lógica expuesta al frontend
- db.rs: manejo de SQLite
- automation.rs: lógica de escritura automática
- window.rs: control de ventanas

Esto permite simplicidad sin sobreingeniería.

---

# Backend (Rust + Tauri)

Responsabilidades:

- Control de ejecución de comandos
- Acceso a base de datos SQLite
- Integración con el sistema operativo (input y ventanas)

Tecnologías:

- Tauri
- Rust
- SQLite

---

# Base de Datos

SQLite con una tabla básica:

```sql
CREATE TABLE commands (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  command TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

# Frontend

Tecnologías:

- HTML y JavaScript (o framework ligero opcional)
- Tailwind CSS

Estilo:

- Desarrollo rápido con Tailwind
- Identidad visual basada en Glassmorphism
- Tipografía Roboto

---

# Decisiones de Diseño

- Simplicidad sobre complejidad
- UI ligera sin dependencias innecesarias
- Backend robusto en Rust
- Persistencia local con SQLite
- Experiencia enfocada en precisión y velocidad

---

# Casos de Uso

- Instalación de servicios en servidores remotos
- Automatización en consolas web
- Ejecución repetitiva de comandos
- Configuración de túneles como Cloudflare
- Entornos de laboratorio y testing

---

# Posibles Extensiones

- Ejecución remota vía SSH
- Importación y exportación de comandos
- Soporte multi-ventana avanzado
- Integración con APIs externas

---

# Estado del Proyecto

MVP enfocado en:

- escritura automática
- historial
- ejecución básica

---

# Concepto Clave

No es una terminal tradicional.
Es un orquestador de comandos para entornos donde el input convencional falla.

---
