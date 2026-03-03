---
id: nomadear-registrations-skill
title: "Claude Skill: Preinscripciones Nomadear"
sidebar_label: "Nomadear Registrations Skill"
---

# Claude Skill: Preinscripciones Nomadear

Skill que guía a Claude para trabajar con el sistema de preinscripciones públicas de Nomadear: registro individual, aprobación/rechazo, bulk upload por CSV y validación de duplicados.

:::tip Descarga el skill
<a href="/flock-tech-guides/skills/nomadear-registrations/SKILL.md" download="SKILL.md">⬇ Descargar SKILL.md</a> — guardalo en `~/.claude/skills/nomadear-registrations/SKILL.md` para instalarlo directamente.
:::

## ¿Qué hace?

Cuando Claude trabaja con preinscripciones, este skill le indica:

- El enum `RegisterStatus` y sus transiciones (`PENDING` → `APPROVED` / `REJECTED`)
- El endpoint de **registro público** sin autenticación
- El flujo de **aprobación y rechazo** con notificaciones
- El formato del **bulk upload CSV** y cómo parsear la respuesta
- Validaciones de **duplicados** por email + evento
- Verificación de **capacidad** disponible antes de aprobar
- La distinción entre `Registration` (preinscripción) y `EventAttendee` (asistente confirmado)

## ¿Cuándo se activa?

Claude lo invoca automáticamente al detectar:

> *"Crear preinscripción"*, *"Aprobar preinscripción"*, *"Rechazar preinscripción"*, *"Bulk upload CSV"*, *"Validar duplicados"*

## Estados de preinscripción

| Estado | Descripción |
|---|---|
| `PENDING` | Recién creada, esperando revisión |
| `APPROVED` | Aprobada, pasa a ser `EventAttendee` |
| `REJECTED` | Rechazada con motivo opcional |

## Instalación rápida

1. Descargá el `SKILL.md` con el botón de arriba
2. Abrí Claude Code en tu terminal
3. Adjuntá el archivo y enviá:

> *"Instalá este skill en `~/.claude/skills/nomadear-registrations/SKILL.md`"*

## Nivel de aplicación

**Tipo:** Automático por inferencia | **Nivel:** Intermedio
