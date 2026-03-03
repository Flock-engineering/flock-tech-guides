---
id: jira-skill
title: "Claude Skill: Generar tarjetas Jira"
sidebar_label: "Jira Skill"
---

# Claude Skill: Generar tarjetas Jira

Skill que guía a Claude para convertir commits y features en tarjetas de Jira con estructura estandarizada, listos para copiar al tablero del proyecto.

:::tip Descarga el skill
<a href="/flock-tech-guides/skills/jira/SKILL.md" download="SKILL.md">⬇ Descargar SKILL.md</a> — guardalo en `~/.claude/skills/jira/SKILL.md` para instalarlo directamente.
:::

## ¿Qué hace?

A partir del historial de git o de una descripción de feature, Claude genera:

- **Título** de la tarjeta Jira en formato estandarizado
- **Descripción** con contexto técnico y de negocio
- **Criterios de aceptación** en formato checklist
- **Subtareas** si el feature lo requiere
- **Etiquetas** según el módulo afectado

## ¿Cuándo se activa?

Claude lo invoca automáticamente al detectar:

> *"Crear tarjeta Jira"*, *"Generar tickets"*, *"Documentar feature para Jira"*, *"Preparar release notes"*

## Mapeo commit → Jira

| Tipo de commit | Tipo de tarjeta Jira |
|---|---|
| `feat` | Historia de usuario / Story |
| `fix` | Bug |
| `refactor` | Tarea técnica |
| `docs` | Tarea de documentación |
| `test` | Tarea de QA |
| `chore` | Tarea de mantenimiento |

## Instalación rápida

1. Descargá el `SKILL.md` con el botón de arriba
2. Abrí Claude Code en tu terminal
3. Adjuntá el archivo y enviá:

> *"Instalá este skill en `~/.claude/skills/jira/SKILL.md`"*

## Nivel de aplicación

**Tipo:** Manual | **Nivel:** Básico
