---
id: post-work-skill
title: "Claude Skill: Post-Work Summary"
sidebar_label: "Post-Work Summary Skill"
---

# Claude Skill: Post-Work Summary

Skill que instruye a Claude para mostrar un **resumen de ejecución al finalizar cada tarea** — incluyendo modelo utilizado, duración estimada, tokens consumidos, sub-agentes invocados y un checklist de lo guardado en Engram.

:::tip Descarga el skill
<a href="/flock-tech-guides/skills/post-work/SKILL.md" download="SKILL.md">⬇ Descargar SKILL.md</a> — guardalo en `~/.claude/skills/post-work/SKILL.md` para instalarlo directamente.
:::

## ¿Qué hace?

Al finalizar cualquier tarea significativa, Claude muestra un bloque estructurado:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 POST-WORK SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 Model        claude-sonnet-4-6
 Duration     ~2m 14s
 Tokens       61,646 total (input: 58.2k / output: 3.4k)

 Sub-agents
 ┌─────────────────────────────┬──────────┬──────────────┐
 │ Agent                       │ Duration │ Tokens       │
 ├─────────────────────────────┼──────────┼──────────────┤
 │ Explorar estructura skills  │ ~1m 40s  │ 61,646       │
 └─────────────────────────────┴──────────┴──────────────┘

 Engram
 ✅ Guardado: estructura de skills en flock-tech-guides
 ⬜ Pendiente: confirmar skill antes de crear archivos

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## ¿Cuándo se activa?

Se activa automáticamente al completar cualquier tarea que involucre:

- Creación o edición de archivos
- Implementación de código o features
- Decisiones arquitectónicas documentadas
- Bugs resueltos con causa raíz identificada
- Tareas que involucraron sub-agentes

> No aparece en respuestas cortas, preguntas de clarificación ni saludos.

## Campos del resumen

| Campo | Descripción |
|---|---|
| **Model** | ID exacto del modelo utilizado en la sesión |
| **Duration** | Duración estimada de la tarea (prefijo `~`) |
| **Tokens** | Total consumido, desglosado en input y output |
| **Sub-agents** | Tabla con nombre, duración y tokens de cada sub-agente invocado |
| **Engram** | Checklist de observaciones guardadas (✅) o pendientes (⬜) |

## ¿Para qué sirve?

- **Trazabilidad**: sabés exactamente qué modelo ejecutó cada tarea
- **Control de costos**: tokens visibles en cada operación
- **Auditoría de memoria**: confirmación explícita de qué se guardó en Engram
- **Observabilidad de agentes**: cuántos sub-agentes se usaron y cuánto costó cada uno

## Instalación rápida

1. Descargá el `SKILL.md` con el botón de arriba
2. Guardalo en `~/.claude/skills/post-work/SKILL.md`
3. Listo — Claude lo aplica automáticamente al terminar cada tarea

## Nivel de aplicación

**Tipo:** Siempre activo | **Nivel:** Meta / Observabilidad
