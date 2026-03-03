---
id: nomadear-api-skill
title: "Claude Skill: Convenciones API Nomadear"
sidebar_label: "Nomadear API Skill"
---

# Claude Skill: Convenciones API Nomadear

Skill que guía a Claude para diseñar y crear endpoints REST siguiendo las convenciones de URL, status codes, estructura de responses, paginación y manejo de errores del proyecto Nomadear.

:::tip Descarga el skill
<a href="/flock-tech-guides/skills/nomadear-api/SKILL.md" download="SKILL.md">⬇ Descargar SKILL.md</a> — guardalo en `~/.claude/skills/nomadear-api/SKILL.md` para instalarlo directamente.
:::

## ¿Qué hace?

Cuando Claude crea un endpoint, este skill le indica:

- Convenciones de **nomenclatura de URLs** (recursos en plural, kebab-case)
- Qué **HTTP status codes** usar en cada caso
- Cómo estructurar **responses exitosas** y de **error**
- Cómo implementar **paginación** y **filtros**
- La tabla completa de endpoints del proyecto: `auth`, `users`, `events`, `registrations`, `attendees`, `dealerships` y `bot`

## ¿Cuándo se activa?

Claude lo invoca automáticamente al detectar:

> *"Crear endpoint REST"*, *"Diseñar API"*, *"Estructurar response"*, *"Manejar errores HTTP"*, *"Paginar resultados"*

## Módulos de la API

| Módulo | Prefijo | Descripción |
|---|---|---|
| `auth` | `/auth` | Login, registro, JWT refresh |
| `users` | `/users` | Gestión de usuarios y perfiles |
| `events` | `/events` | CRUD de eventos y sus estados |
| `registrations` | `/registrations` | Preinscripciones públicas |
| `attendees` | `/attendees` | Asistentes confirmados |
| `dealerships` | `/dealerships` | Concesionarias |
| `bot` | `/bot` | Consultas al asistente IA |

## Instalación rápida

1. Descargá el `SKILL.md` con el botón de arriba
2. Abrí Claude Code en tu terminal
3. Adjuntá el archivo y enviá:

> *"Instalá este skill en `~/.claude/skills/nomadear-api/SKILL.md`"*

## Nivel de aplicación

**Tipo:** Automático por inferencia | **Nivel:** Intermedio
