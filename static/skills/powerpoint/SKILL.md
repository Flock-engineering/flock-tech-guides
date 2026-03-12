---
name: powerpoint
description: >
  Genera presentaciones PowerPoint (.pptx) con estilo profesional y compatibilidad con SharePoint.
  Trigger: crear presentación PowerPoint, generar .pptx, crear slides, crear deck, crear diapositivas
license: MIT
metadata:
  author: flock-engineering
  version: '1.0'
  scope: [root]
  auto_invoke:
    - 'Crear presentación PowerPoint'
    - 'Generar .pptx'
    - 'Crear slides'
    - 'Crear deck'
    - 'Crear diapositivas'
    - 'Generar presentación'
allowed-tools: Read, Edit, Write, Glob, Grep, Bash
---

# PowerPoint Skill

## Critical Rules

### ALWAYS

- Usar **python-pptx** para generar `.pptx`
- Guardar siempre como `.pptx` — compatible con SharePoint, Teams y PowerPoint Online
- Usar `Pt()` para tamaños de fuente, `Cm()` o `Inches()` para posición/tamaño
- Mantener jerarquía visual: título > subtítulo > cuerpo
- Definir colores como constantes en hex (`RGBColor`)
- Usar `add_paragraph()` con `level` para bullets anidados
- Agregar `prs.core_properties` (título, autor) para metadata correcta
- Testear que el archivo abre sin errores con `python -c "from pptx import Presentation; Presentation('output.pptx')"`

### NEVER

- Usar coordenadas hardcodeadas sin constantes nombradas
- Mezclar fuentes o tamaños arbitrariamente — respetar la jerarquía tipográfica
- Dejar placeholders vacíos sin texto (los lectores de pantalla los anuncian)
- Usar macros VBA — incompatibles con SharePoint Online y PowerPoint Online
- Insertar imágenes sin verificar que el archivo existe
- Usar `.ppt` (formato legacy) — siempre `.pptx`

---

## Setup y Constantes

```python
from pptx import Presentation
from pptx.util import Inches, Cm, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.util import Emu
from datetime import datetime

# ── Paleta de colores ────────────────────────────────────────────────
COLOR_PRIMARY   = RGBColor(0x1F, 0x2D, 0x5A)  # Azul corporativo
COLOR_ACCENT    = RGBColor(0xFF, 0x6B, 0x35)  # Naranja acento
COLOR_BG_LIGHT  = RGBColor(0xF5, 0xF5, 0xF5)  # Gris claro
COLOR_WHITE     = RGBColor(0xFF, 0xFF, 0xFF)
COLOR_TEXT      = RGBColor(0x1A, 0x1A, 0x1A)
COLOR_MUTED     = RGBColor(0x66, 0x66, 0x66)

# ── Tipografía ────────────────────────────────────────────────────────
FONT_TITLE      = 'Calibri'
FONT_BODY       = 'Calibri'
SIZE_TITLE      = Pt(36)
SIZE_SUBTITLE   = Pt(24)
SIZE_HEADING    = Pt(20)
SIZE_BODY       = Pt(16)
SIZE_CAPTION    = Pt(12)

# ── Layout de slide (16:9 estándar) ──────────────────────────────────
SLIDE_WIDTH     = Inches(13.33)
SLIDE_HEIGHT    = Inches(7.5)
MARGIN          = Cm(1.5)
```

---

## Helpers Reutilizables

```python
from pptx.util import Inches, Cm, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from typing import Optional

def add_text_box(
    slide,
    text: str,
    left: float,
    top: float,
    width: float,
    height: float,
    font_size: int = 16,
    bold: bool = False,
    color: RGBColor = COLOR_TEXT,
    align: PP_ALIGN = PP_ALIGN.LEFT,
    font_name: str = FONT_BODY,
):
    """Agrega un text box posicionado y formateado."""
    txBox = slide.shapes.add_textbox(
        Cm(left), Cm(top), Cm(width), Cm(height)
    )
    tf = txBox.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.alignment = align
    run = p.add_run()
    run.text = text
    run.font.name = font_name
    run.font.size = Pt(font_size)
    run.font.bold = bold
    run.font.color.rgb = color
    return txBox


def set_slide_background(slide, color: RGBColor) -> None:
    """Rellena el fondo del slide con un color sólido."""
    from pptx.oxml.ns import qn
    from lxml import etree
    background = slide.background
    fill = background.fill
    fill.solid()
    fill.fore_color.rgb = color


def add_slide_title(
    slide,
    title: str,
    subtitle: str = '',
    bg_color: RGBColor = COLOR_PRIMARY,
) -> None:
    """Slide de título con fondo de color y texto blanco."""
    set_slide_background(slide, bg_color)
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
            font_size=20,
            color=RGBColor(0xCC, 0xCC, 0xCC), align=PP_ALIGN.CENTER,
        )


def add_bullets(
    slide,
    items: list[str | tuple[str, int]],  # str o (texto, nivel)
    left: float = 1.5,
    top: float = 3.5,
    width: float = 20.0,
    height: float = 5.0,
    font_size: int = 16,
) -> None:
    """Agrega lista de bullets con soporte de niveles (0=principal, 1=sub)."""
    txBox = slide.shapes.add_textbox(
        Cm(left), Cm(top), Cm(width), Cm(height)
    )
    tf = txBox.text_frame
    tf.word_wrap = True

    for i, item in enumerate(items):
        if isinstance(item, tuple):
            text, level = item
        else:
            text, level = item, 0

        p = tf.add_paragraph() if i > 0 else tf.paragraphs[0]
        p.level = level
        p.space_before = Pt(6 if level == 0 else 2)
        run = p.add_run()
        run.text = ('• ' if level == 0 else '◦ ') + text
        run.font.name = FONT_BODY
        run.font.size = Pt(font_size if level == 0 else font_size - 2)
        run.font.color.rgb = COLOR_TEXT
```

---

## Professional Presentation Base

```python
"""Presentación profesional base — copiar y adaptar."""
from pptx import Presentation
from pptx.util import Inches

def build_presentation(output_path: str = 'presentacion.pptx') -> None:
    prs = Presentation()
    prs.slide_width  = SLIDE_WIDTH
    prs.slide_height = SLIDE_HEIGHT

    # Metadata
    prs.core_properties.title   = 'Título de la Presentación'
    prs.core_properties.author  = 'Flock Engineering'
    prs.core_properties.subject = 'Descripción breve'

    # Layout en blanco (index 6 en la mayoría de templates)
    blank_layout = prs.slide_layouts[6]

    # ── Slide 1: Título ──────────────────────────────────────────────
    slide1 = prs.slides.add_slide(blank_layout)
    add_slide_title(
        slide1,
        title='Título Principal',
        subtitle='Subtítulo o fecha — Flock Engineering',
        bg_color=COLOR_PRIMARY,
    )

    # ── Slide 2: Contenido con bullets ───────────────────────────────
    slide2 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide2, COLOR_WHITE)
    add_text_box(
        slide2, 'Puntos Clave',
        left=1.5, top=0.8, width=20.0, height=1.2,
        font_size=28, bold=True, color=COLOR_PRIMARY,
    )
    add_bullets(
        slide2,
        items=[
            'Primer punto principal',
            ('Detalle del primer punto', 1),
            ('Otro detalle', 1),
            'Segundo punto principal',
            ('Detalle del segundo punto', 1),
            'Tercer punto principal',
        ],
        top=2.5,
    )

    # ── Slide 3: Dos columnas ────────────────────────────────────────
    slide3 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide3, COLOR_BG_LIGHT)
    add_text_box(
        slide3, 'Comparación',
        left=1.5, top=0.8, width=20.0, height=1.2,
        font_size=28, bold=True, color=COLOR_PRIMARY,
    )
    # Columna izquierda
    add_text_box(
        slide3, 'Antes', left=1.5, top=2.3, width=9.5, height=0.8,
        font_size=18, bold=True, color=COLOR_ACCENT,
    )
    add_bullets(slide3, ['Item A', 'Item B', 'Item C'], left=1.5, top=3.2, width=9.5)
    # Columna derecha
    add_text_box(
        slide3, 'Después', left=12.5, top=2.3, width=9.5, height=0.8,
        font_size=18, bold=True, color=COLOR_PRIMARY,
    )
    add_bullets(slide3, ['Item X', 'Item Y', 'Item Z'], left=12.5, top=3.2, width=9.5)

    # ── Slide final: Cierre ───────────────────────────────────────────
    slide_final = prs.slides.add_slide(blank_layout)
    add_slide_title(
        slide_final,
        title='¿Preguntas?',
        subtitle='contacto@flock.com',
        bg_color=COLOR_ACCENT,
    )

    prs.save(output_path)
    print(f'✅ Presentación guardada en: {output_path}')


if __name__ == '__main__':
    build_presentation()
```

---

## Insertar Imagen

```python
from pathlib import Path

def add_image(
    slide,
    image_path: str | Path,
    left: float,
    top: float,
    width: float,
    height: float | None = None,  # None = proporcional al ancho
) -> None:
    path = Path(image_path)
    if not path.exists():
        raise FileNotFoundError(f"Imagen no encontrada: {path}")

    slide.shapes.add_picture(
        str(path),
        Cm(left),
        Cm(top),
        width=Cm(width),
        height=Cm(height) if height else None,
    )
```

---

## Commands

```bash
# Instalar
pip install python-pptx

# Generar presentación
python presentation.py

# Verificar que el archivo es válido
python -c "from pptx import Presentation; Presentation('presentacion.pptx'); print('OK')"

# Ver slides generados (macOS)
open presentacion.pptx

# Ver slides generados (Linux con LibreOffice)
libreoffice --impress presentacion.pptx
```
