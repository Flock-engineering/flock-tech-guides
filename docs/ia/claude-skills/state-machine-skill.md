---
id: state-machine-skill
title: "Claude Skill: Máquinas de Estado (FSM)"
sidebar_label: "State Machine Skill"
---

# Claude Skill: Máquinas de Estado (FSM)

Skill que guía a Claude para analizar un módulo e implementar una **Máquina de Estado Finita (FSM)** para sus estados y transiciones, aplicable a cualquier proyecto TypeScript.

:::tip Descarga el skill
<a href="/flock-tech-guides/skills/state-machine/SKILL.md" download="SKILL.md">⬇ Descargar SKILL.md</a> — guardalo en `~/.claude/skills/state-machine/SKILL.md` para instalarlo directamente.
:::

## ¿Qué hace?

Cuando se invoca `/state-machine [módulo]`, Claude:

1. **Lee el contexto** del módulo (estados existentes, cómo se cambia de estado, eventos que lo disparan)
2. **Analiza problemas** como flags booleanas independientes, transiciones sin validar y lógica dispersa
3. **Diseña la FSM** mostrando el diagrama de transiciones antes de escribir código
4. **Implementa** `{entidad}.states.ts` (enums) y `{entidad}.machine.ts` (función `transition()`)
5. **Integra** la FSM en el servicio existente reemplazando la lógica anterior
6. **Actualiza** el `CLAUDE.md` del módulo con la sección "Estado FSM"

## ¿Cuándo se activa?

Invocarlo manualmente con:

> `/state-machine [módulo]`

Ejemplos:
- `/state-machine orders` → FSM para estados `pending/approved/delivered/cancelled`
- `/state-machine invoices` → FSM para procesamiento async `idle/loading/success/error`
- `/state-machine registrations` → FSM para flujo de aprobación `pending/validated/rejected`

## Artefactos generados

| Archivo | Descripción |
|---|---|
| `machine/{entidad}.states.ts` | Enums de estados y eventos — completamente tipados |
| `machine/{entidad}.machine.ts` | Mapa de transiciones y función pura `transition()` |
| Refactor del servicio | Reemplaza flags booleanas y lógica dispersa por la FSM |
| `CLAUDE.md` (actualizado) | Sección "Estado FSM" con diagrama y archivos |

## Reglas de aplicación

- Si los estados son ≤ 2 simples sin riesgo de inconsistencia, Claude **avisa que es sobreingeniería** y no implementa la FSM
- Si el enum ya existe en el schema (Prisma, etc.), **no lo duplica** — lo importa
- **Siempre muestra el diagrama de transiciones** antes de escribir código para validar con el usuario
- La función `transition()` es **pura**: no tiene efectos secundarios, solo retorna el estado siguiente

## Instalación rápida

1. Descargá el `SKILL.md` con el botón de arriba
2. Abrí Claude Code en tu terminal
3. Adjuntá el archivo y enviá:

> *"Instalá este skill en `~/.claude/skills/state-machine/SKILL.md`"*

## Nivel de aplicación

**Tipo:** Manual (`/state-machine`) | **Nivel:** Avanzado
