---
id: canvas-design-skill
title: "Claude Skill: Canvas Design"
sidebar_label: "Canvas Design"
---

# Claude Skill: Canvas Design

Skill que guía a Claude para **crear diseños visuales de calidad museo** — posters, arte abstracto, piezas de diseño — como archivos `.pdf` o `.png`, precedidos por una filosofía de diseño escrita que fundamenta cada decisión estética.

:::tip Descarga el skill
<a href="/flock-tech-guides/skills/canvas-design/SKILL.md" download="SKILL.md">⬇ Descargar SKILL.md</a> — guardalo en `~/.claude/skills/canvas-design/SKILL.md` para instalarlo directamente.
:::

## ¿Qué hace?

Cuando Claude crea un diseño visual, este skill le indica:

- **Crear una filosofía de diseño** primero (4-6 párrafos) — un movimiento estético que guía cada elección formal
- **Expresarla en un canvas** como `.pdf` o `.png` de alta calidad con Python
- **Usar texto mínimo**: el texto es elemento visual, no explicación — nunca párrafos, solo palabras o frases esenciales integradas al diseño
- **Priorizar formas, color y composición** sobre ilustración o decoración
- **Usar tipografía del directorio `./canvas-fonts`** — fuentes que se vuelven parte del arte, no texto tipografiado digitalmente
- **Segunda pasada obligatoria**: refinar sin agregar, hacer más cohesivo, más pristino

## ¿Cuándo se activa?

> *"Crear un poster"*, *"Diseñar una pieza"*, *"Arte visual"*, *"Diseño abstracto"*, *"Crear artwork"*

## Proceso creativo

| Paso | Qué hace |
|---|---|
| 1. Filosofía | Crea un movimiento estético visual en `.md` (genérico, sin mencionar la intención) |
| 2. Referencia sutil | Deduce el hilo conceptual que le da profundidad sin anunciarse |
| 3. Canvas | Expresa la filosofía en Python como `.pdf` o `.png` |
| 4. Refinamiento | Segunda pasada: más cohesión, más pristino — sin agregar elementos |

## Principios de diseño

| Principio | Descripción |
|---|---|
| Visual sobre texto | 90% imagen, 10% texto mínimo e integrado |
| Lenguaje sistemático | Marcas repetidas, patrones acumulados, referencia científica imaginaria |
| Paleta limitada | Colores intencionales y cohesivos, no decorativos |
| Tipografía como arte | Fuentes descargadas, llevadas al canvas como elemento gráfico |
| Sin overlaps | Ningún elemento se sale del canvas ni se superpone sin intención |
| Craftsmanship total | Cada detalle refinado como si hubiera tomado horas |

## Ejemplos de movimientos de diseño

- **Concrete Poetry**: Bloques de color monumentales, tipografía escultórica, energía de poster polaco
- **Chromatic Language**: Zonas de color como sistema de información, etiquetas mínimas flotando en el espacio
- **Analog Meditation**: Grano de papel, tinta, vastísimo espacio negativo — estética de fotobook japonés
- **Geometric Silence**: Precisión de grilla, fotografía dramática, zonas de silencio — Swiss formalism meets Brutalism

## Instalación rápida

1. Descargá el `SKILL.md` con el botón de arriba
2. Abrí Claude Code en tu terminal
3. Adjuntá el archivo y enviá:

> *"Instalá este skill en `~/.claude/skills/canvas-design/SKILL.md`"*

## Nivel de aplicación

**Tipo:** Automático por palabras clave | **Nivel:** Avanzado | **Output:** `.pdf` o `.png` + `.md` filosofía
