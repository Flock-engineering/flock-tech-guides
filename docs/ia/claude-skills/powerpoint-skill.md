---
id: powerpoint-skill
title: "Claude Skill: PowerPoint"
sidebar_label: "PowerPoint Skill"
---

# Claude Skill: PowerPoint

Skill que guía a Claude para generar presentaciones PowerPoint (`.pptx`) con python-pptx, estilo profesional, jerarquía tipográfica y compatibilidad con SharePoint y Teams.

:::tip Descarga el skill
<a href="/flock-tech-guides/skills/powerpoint/SKILL.md" download="SKILL.md">⬇ Descargar SKILL.md</a> — guardalo en `~/.claude/skills/powerpoint/SKILL.md` para instalarlo directamente.
:::

## ¿Qué hace?

Cuando Claude genera una presentación PowerPoint, este skill le indica:

- Usar **python-pptx** para generar `.pptx`
- Guardar siempre como `.pptx` — compatible con SharePoint, Teams y PowerPoint Online
- Usar `Pt()` para fuentes, `Cm()` o `Inches()` para posición y tamaño
- Mantener jerarquía visual: título > subtítulo > cuerpo
- Definir colores como constantes en hex con `RGBColor`
- Usar `add_paragraph()` con `level` para bullets anidados
- Agregar `prs.core_properties` (título, autor) para metadata correcta
- Verificar que el `.pptx` abre sin errores al final de la generación

## ¿Cuándo se activa?

Claude lo invoca automáticamente al detectar:

> *"Crear presentación PowerPoint"*, *"Generar .pptx"*, *"Crear slides"*, *"Crear deck"*, *"Crear diapositivas"*, *"Generar presentación"*

## Reglas de calidad

| Regla | Descripción |
|---|---|
| **Sin coordenadas hardcodeadas** | Usar constantes nombradas (`MARGIN`, `SLIDE_WIDTH`) |
| **Sin fuentes mezcladas** | Respetar la jerarquía tipográfica definida |
| **Sin macros VBA** | Incompatibles con SharePoint Online |
| **Sin `.ppt` legacy** | Siempre `.pptx` |
| **Sin placeholders vacíos** | Los lectores de pantalla los anuncian |
| **Verificar imágenes** | `Path(image_path).exists()` antes de insertar |

## Setup y paleta de colores

```python
from pptx.util import Inches, Cm, Pt
from pptx.dml.color import RGBColor

COLOR_PRIMARY  = RGBColor(0x1F, 0x2D, 0x5A)  # Azul corporativo
COLOR_ACCENT   = RGBColor(0xFF, 0x6B, 0x35)  # Naranja acento
COLOR_WHITE    = RGBColor(0xFF, 0xFF, 0xFF)

FONT_BODY      = 'Calibri'
SIZE_TITLE     = Pt(36)
SIZE_BODY      = Pt(16)

SLIDE_WIDTH    = Inches(13.33)
SLIDE_HEIGHT   = Inches(7.5)
```

## Slide de título con fondo de color

```python
def add_slide_title(slide, title: str, subtitle: str = '') -> None:
    set_slide_background(slide, COLOR_PRIMARY)
    add_text_box(
        slide, title,
        left=1.5, top=2.5, width=20.0, height=2.0,
        font_size=40, bold=True,
        color=COLOR_WHITE, align=PP_ALIGN.CENTER,
    )
    if subtitle:
        add_text_box(
            slide, subtitle,
            left=1.5, top=4.8, width=20.0, height=1.0,
            font_size=20, color=RGBColor(0xCC, 0xCC, 0xCC),
            align=PP_ALIGN.CENTER,
        )
```

## Instalación rápida

1. Descargá el `SKILL.md` con el botón de arriba
2. Abrí Claude Code en tu terminal
3. Adjuntá el archivo y enviá:

> *"Instalá este skill en `~/.claude/skills/powerpoint/SKILL.md`"*

## Nivel de aplicación

**Tipo:** Automático por inferencia | **Nivel:** Avanzado
