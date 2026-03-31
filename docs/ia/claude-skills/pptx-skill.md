---
id: pptx-skill
title: "Claude Skill: PowerPoint (PPTX)"
sidebar_label: "PowerPoint (PPTX)"
---

# Claude Skill: PowerPoint (PPTX)

Skill que guía a Claude para **crear, leer, editar y manipular presentaciones `.pptx`** — desde extraer texto hasta construir decks completos con diseño profesional usando `pptxgenjs` y `markitdown`.

:::tip Descarga el skill
<a href="/flock-tech-guides/skills/pptx/SKILL.md" download="SKILL.md">⬇ Descargar SKILL.md</a> — guardalo en `~/.claude/skills/pptx/SKILL.md` para instalarlo directamente.
:::

## ¿Qué hace?

Cuando Claude trabaja con presentaciones, este skill le indica:

- **Extraer texto y contenido** de cualquier `.pptx` con `markitdown`
- **Editar presentaciones existentes** desempaquetando el XML, modificando y reempaquetando
- **Crear desde cero** usando `pptxgenjs` cuando no hay template disponible
- **Diseñar slides con criterio**: paletas de colores coherentes, tipografía variada, layouts creativos — nunca bullets en blanco aburridos
- **QA visual obligatorio**: convertir slides a imágenes y revisar overlaps, overflow, bajo contraste y placeholders sin reemplazar
- **Verificar** con subagentes de visión tras cada iteración antes de declarar éxito

## ¿Cuándo se activa?

Claude lo invoca automáticamente al detectar menciones de presentaciones o archivos `.pptx`:

> *"Crear un deck"*, *"Hacer slides"*, *"Generar presentación"*, *"Leer un .pptx"*, *"Editar la presentación"*, *"Extraer texto del PPT"*

## Flujo de trabajo

| Tarea | Herramienta |
|---|---|
| Leer/analizar contenido | `python -m markitdown presentation.pptx` |
| Editar template existente | Unpack XML → editar → pack |
| Crear desde cero | `pptxgenjs` (Node.js) |
| Inspección visual | `soffice` → PDF → `pdftoppm` → imágenes |
| QA de contenido | `markitdown` + grep de placeholders |

## Principios de diseño

El skill instruye a Claude a **no crear slides aburridos**. Incluye guías sobre:

- **Paletas de colores por tema**: Midnight Executive, Forest & Moss, Coral Energy, Terracotta y más — nunca azul genérico
- **Layouts variados**: two-column, icon+text rows, grids, half-bleed images
- **Tipografía con contraste**: títulos 36-44pt, body 14-16pt, fuentes con personalidad
- **Elementos visuales en cada slide**: imagen, chart, icono o shape — nunca solo texto
- **Nunca**: líneas de acento bajo títulos, texto centrado en párrafos, slides monótonos

## QA obligatorio

El skill exige un ciclo de verificación antes de entregar:

```bash
# Convertir a imágenes para inspección visual
python -m markitdown output.pptx | grep -iE "xxxx|lorem|ipsum"
soffice --headless --convert-to pdf output.pptx
pdftoppm -jpeg -r 150 output.pdf slide
```

## Instalación rápida

1. Descargá el `SKILL.md` con el botón de arriba
2. Abrí Claude Code en tu terminal
3. Adjuntá el archivo y enviá:

> *"Instalá este skill en `~/.claude/skills/pptx/SKILL.md`"*

## Nivel de aplicación

**Tipo:** Automático por detección de `.pptx` o palabras clave | **Nivel:** Avanzado | **Formato:** `.pptx`
