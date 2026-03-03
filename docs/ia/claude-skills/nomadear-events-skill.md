---
id: nomadear-events-skill
title: "Claude Skill: Sistema de Eventos Nomadear"
sidebar_label: "Nomadear Events Skill"
---

# Claude Skill: Sistema de Eventos Nomadear

Skill que guía a Claude para trabajar con el sistema de eventos de Nomadear: ciclo de vida, estados, modificaciones, historial de cambios y transiciones permitidas.

:::tip Descarga el skill
<a href="/flock-tech-guides/skills/nomadear-events/SKILL.md" download="SKILL.md">⬇ Descargar SKILL.md</a> — guardalo en `~/.claude/skills/nomadear-events/SKILL.md` para instalarlo directamente.
:::

## ¿Qué hace?

Cuando Claude trabaja con eventos, este skill le indica:

- El enum `EventStatus` y las **transiciones de estado válidas**
- El enum `EventAction` para registrar modificaciones
- Patrones para **crear**, **editar**, **reprogramar**, **suspender**, **restaurar** y **cancelar** eventos
- Cómo consultar el **historial de modificaciones** de un evento
- Cálculo de **capacidad** y validaciones de negocio
- Los modelos Prisma del módulo y archivos clave

## ¿Cuándo se activa?

Claude lo invoca automáticamente al detectar:

> *"Crear evento"*, *"Modificar evento"*, *"Reprogramar evento"*, *"Suspender evento"*, *"Cancelar evento"*, *"Ver historial de evento"*

## Estados del evento

| Estado | Descripción |
|---|---|
| `DRAFT` | Borrador, no visible públicamente |
| `PUBLISHED` | Publicado y visible |
| `SUSPENDED` | Suspendido temporalmente |
| `CANCELLED` | Cancelado definitivamente |
| `COMPLETED` | Finalizado |

## Transiciones permitidas

| Desde | Hacia |
|---|---|
| `DRAFT` | `PUBLISHED` |
| `PUBLISHED` | `SUSPENDED`, `CANCELLED` |
| `SUSPENDED` | `PUBLISHED`, `CANCELLED` |

## Instalación rápida

1. Descargá el `SKILL.md` con el botón de arriba
2. Abrí Claude Code en tu terminal
3. Adjuntá el archivo y enviá:

> *"Instalá este skill en `~/.claude/skills/nomadear-events/SKILL.md`"*

## Nivel de aplicación

**Tipo:** Automático por inferencia | **Nivel:** Avanzado
