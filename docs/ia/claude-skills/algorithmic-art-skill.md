---
id: algorithmic-art-skill
title: "Claude Skill: Algorithmic Art"
sidebar_label: "Algorithmic Art"
---

# Claude Skill: Algorithmic Art

Skill que guía a Claude para **crear arte generativo interactivo** usando `p5.js` con randomness seedeada, campos de flujo, sistemas de partículas y exploración paramétrica — produciendo artefactos HTML auto-contenidos que funcionan directo en el browser.

:::tip Descarga el skill
<a href="/flock-tech-guides/skills/algorithmic-art/SKILL.md" download="SKILL.md">⬇ Descargar SKILL.md</a> — guardalo en `~/.claude/skills/algorithmic-art/SKILL.md` para instalarlo directamente.
:::

## ¿Qué hace?

Cuando Claude crea arte algorítmico, este skill le indica:

- **Crear una filosofía algorítmica** primero (4-6 párrafos) — un movimiento estético computacional que guía la implementación
- **Implementar en p5.js** con randomness seedeada para resultados reproducibles (`randomSeed`, `noiseSeed`)
- **Generar un artefacto HTML auto-contenido** con controles interactivos, navegación de seeds y botón de descarga
- **Diseñar parámetros tuneables** emergentes de la filosofía (cantidad, escala, velocidad, proporción)
- **Usar un template base** con branding consistente — nunca crear HTML desde cero
- Producir arte de calidad **galería**: flujos orgánicos, noise fields, cristalización estocástica, armonías cuánticas

## ¿Cuándo se activa?

> *"Crear arte algorítmico"*, *"Generar arte generativo"*, *"Hacer un flow field"*, *"Sistema de partículas"*, *"Arte con código"*

## Proceso creativo

| Paso | Qué hace |
|---|---|
| 1. Filosofía | Crea un movimiento estético computacional en `.md` |
| 2. Concepto | Deduce la referencia sutil que le da alma al trabajo |
| 3. Implementación | Expresa la filosofía en p5.js con randomness seedeada |
| 4. UI interactiva | Sidebar con seed navigation, sliders de parámetros, color pickers |

## Capacidades técnicas

| Feature | Descripción |
|---|---|
| Seeded randomness | Mismo seed → mismo resultado siempre |
| Seed navigation | Botones Prev/Next/Random + jump to seed |
| Parámetros en tiempo real | Sliders que actualizan el canvas al instante |
| Descarga PNG | Botón de export incorporado |
| Auto-contenido | Un solo `.html` sin dependencias externas (solo CDN p5.js) |

## Ejemplos de movimientos algorítmicos

- **Organic Turbulence**: Flow fields con Perlin noise multicapa, partículas acumulando trails
- **Quantum Harmonics**: Interferencia de fases, nodos constructivos y destructivos
- **Stochastic Crystallization**: Circle packing, Voronoi tessellation por relajación
- **Field Dynamics**: Vectores invisibles hechos visibles por el movimiento de partículas

## Instalación rápida

1. Descargá el `SKILL.md` con el botón de arriba
2. Abrí Claude Code en tu terminal
3. Adjuntá el archivo y enviá:

> *"Instalá este skill en `~/.claude/skills/algorithmic-art/SKILL.md`"*

## Nivel de aplicación

**Tipo:** Automático por palabras clave | **Nivel:** Avanzado | **Output:** `.html` interactivo + `.md` filosofía
