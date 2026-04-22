# CommandOrquestor

<p align="center">
  <strong>Automatiza la escritura de comandos en entornos donde copiar/pegar falla</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-v0.1.0--alpha-blue" />
  <img src="https://img.shields.io/badge/status-alpha-orange" />
  <img src="https://img.shields.io/badge/tauri-2.x-purple" />
  <img src="https://img.shields.io/badge/rust-stable-orange" />
  <img src="https://img.shields.io/badge/license-MIT-green" />
</p>

---

## Tabla de contenidos

* [Vista previa](#vista-previa)
* [Estado del proyecto](#estado-del-proyecto)
* [Problema](#problema)
* [Solución](#solución)
* [Características](#características)
* [Arquitectura](#arquitectura)
* [Instalación](#instalación)
* [Permisos del sistema](#permisos-del-sistema)
* [Limitaciones](#limitaciones)
* [Roadmap](#roadmap)
* [Contribuir](#contribuir)
* [Licencia](#licencia)

---

## Vista previa

<p align="center">
  <img width="800" src="https://github.com/user-attachments/assets/50d4fd95-f9cf-4247-b15b-c1b84e5b06ed" /> 
  <img width="800" src="https://github.com/user-attachments/assets/00568732-5c5f-44b0-8310-b28a89438254" /> 
  <img width="800" src="https://github.com/user-attachments/assets/a07df0e3-6e15-418b-a1ec-fd76e167b147" /> 
  <img width="800" src="https://github.com/user-attachments/assets/2f757752-01b7-4c68-a965-208211fb7d6c" />
</p>

> Recomendado: reemplazar por un GIF mostrando ejecución real

---

## Estado del proyecto

**Versión:** `v0.1.0-alpha`
**Progreso estimado:** ~30%

Esta es una versión funcional temprana. La base del sistema está implementada, pero aún no está lista para producción.

---

## Problema

Las consolas web (Proxmox, noVNC, VNC, etc.) presentan limitaciones críticas:

* No permiten copiar/pegar de forma confiable
* Corrompen caracteres especiales (`'`, `"`, `$`, `\`)
* Traducen incorrectamente el teclado
* Incrementan errores humanos
* Hacen difícil repetir comandos complejos

---

## Solución

CommandOrquestor introduce un enfoque basado en **simulación de input controlado**, permitiendo:

* Escritura automatizada precisa
* Ejecución con control de tiempo
* Historial reutilizable
* Selección de ventana destino
* Flujos de comandos encadenados

---

## Características

| Feature   | Descripción                        |
| --------- | ---------------------------------- |
| Historial | Persistencia en SQLite             |
| Escritura | Simulación carácter por carácter   |
| Delay     | Ejecución con retardo configurable |
| Envío     | Simulación de Enter automática     |
| Ventanas  | Enfoque por PID/proceso            |
| Flows     | Secuencias de comandos             |
| Consola   | Logs en tiempo real                |

---

## Arquitectura

### Frontend

```bash
src/
├── components/
├── hooks/
├── routes/
├── stores/
├── services/
```

* React + TypeScript
* TanStack Router
* Estado centralizado

---

### Backend

```bash
src-tauri/src/
├── commands.rs
├── db.rs
├── automation.rs
├── window.rs
```

Responsabilidades:

* Ejecución de comandos
* Control de ventanas
* Persistencia
* Integración con OS

---

## Instalación

### Desarrollo

```bash
pnpm install
pnpm tauri dev
```

---

### Build

```bash
pnpm tauri build
```

Salida:

* `.deb`
* `.AppImage`
* binario

---

## Permisos del sistema

### macOS

* Accesibilidad
* Screen Recording

### Windows

* Sin configuración adicional

### Linux

* X11: funciona directo
* Wayland: limitado

Dependencias:

```bash
sudo apt install xdotool
```

---

## Contribuir

1. Fork del proyecto
2. Crear rama (`feature/...`)
3. Commit claro
4. Abrir Pull Request

---

## Licencia

MIT

---

## Notas

Este proyecto busca resolver un problema específico de automatización en entornos restringidos. La arquitectura está diseñada para escalar, pero aún está en fase de evolución.

---
