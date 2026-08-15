---
id: flock-design-system-skill
title: "Claude Skill: Flock Design System"
sidebar_label: "Flock Design System Skill"
---

# Claude Skill: Flock Design System

Skill que guía a Claude para construir y estilar **cualquier UI de productos Flock** aplicando el **Flock Design System v1.1**: design tokens, escala tipográfica, spacing, componentes y patrones oficiales. Con esto, todo lo que genere Claude sale con la identidad de marca correcta — sin inventar colores ni tamaños.

:::tip Descargá el skill completo
Este skill usa **varios archivos** (no alcanza solo el `SKILL.md`). Descargá los tres y guardalos respetando la estructura:

<DownloadButton to="skills/flock-design-system/SKILL.md">⬇ SKILL.md</DownloadButton> → `~/.claude/skills/flock-design-system/SKILL.md`

<DownloadButton to="skills/flock-design-system/assets/tokens.css">⬇ tokens.css</DownloadButton> → `~/.claude/skills/flock-design-system/assets/tokens.css`

<DownloadButton to="skills/flock-design-system/references/design-system.md">⬇ design-system.md</DownloadButton> → `~/.claude/skills/flock-design-system/references/design-system.md`

Logos (opcionales, para topbars/branding): <DownloadButton to="skills/flock-design-system/assets/flock-logo.svg">flock-logo.svg</DownloadButton> · <DownloadButton to="skills/flock-design-system/assets/flock-mark.svg">flock-mark.svg</DownloadButton> · <DownloadButton to="skills/flock-design-system/assets/flock-mark-white.svg">flock-mark-white.svg</DownloadButton>
:::

## ¿Qué hace?

Cuando Claude construye o restila una UI de Flock, este skill le indica:

- **Design tokens oficiales** (`assets/tokens.css`): paleta de marca, colores de estado, stacks sans/mono, gradientes de marca/nav/stats — todo vía CSS custom properties
- **Regla de la marca**: acción primaria = `--brand` (#7800C0); `--accent` (#F85000) solo para énfasis puntual
- **Escala de valor en superficies**: cards/paneles sobre `--panel`, nunca violeta-sobre-violeta (la "trampa" que aplana la jerarquía)
- **Dark mode** con `html.dark`: `--brand` se aclara a #9D2BD6, nunca se mantiene #7800C0 sobre fondos oscuros
- **Spacing base-4** y escala de radios definida (8/9/12/16/18/20/50%)
- **Datos densos** (números/tablas) con `.text-mono` + `tabular-nums`, no con el stack sans
- **Especificaciones exactas** de componentes (botón, field, chip, card, modal, toast) y patrones (tabs, filter bar, tablas, Gantt) en `references/design-system.md`

## ¿Cuándo se activa?

Claude lo invoca automáticamente al detectar:

> *"Construir o estilar UI de un producto Flock"*, *"Flock branding"*, *"tema violeta de marca"*, *"dark mode Flock"*, *"design tokens de Flock"*, *"componentes Flock"*

Se **saltea** en proyectos que no son de Flock y ya tienen su propio design system.

## Reglas clave

| Regla | Descripción |
|---|---|
| **Nunca inventar valores** | Colores, radios, sombras y tamaños salen solo de `assets/tokens.css` |
| **Colores por variable** | Siempre `var(--brand)`, `var(--text-soft)` — nunca hex crudo en el código generado |
| **Font del sistema** | Stack de fuentes del sistema, sin web fonts |
| **Acción primaria** | `--brand` (#7800C0); `--accent` (#F85000) solo énfasis puntual |
| **Superficies escalonadas** | Cards sobre `--panel`, nunca sobre `--surface`/`--brand-softer` |
| **Dark mode real** | Vía `html.dark`; `--brand` → #9D2BD6, nunca #7800C0 en oscuro |
| **Spacing base-4** | Respetar la escala de radios documentada |
| **Datos = mono** | Números/tablas con `.text-mono` + `tabular-nums` |

## Instalación rápida

1. Descargá los tres archivos con los botones de arriba
2. Recreá la estructura `~/.claude/skills/flock-design-system/` con `SKILL.md`, `assets/tokens.css` y `references/design-system.md`
3. Abrí Claude Code y pedile construir cualquier UI de Flock — el skill se activa solo

O bien, en Claude Code:

> *"Instalá este skill en `~/.claude/skills/flock-design-system/`, respetando la carpeta `assets/` y `references/`"*

## Nivel de aplicación

**Tipo:** Automático por inferencia
