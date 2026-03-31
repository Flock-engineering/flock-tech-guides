---
name: word-doc
description: >
  Genera un documento Word (.docx) con estilo profesional.
  Trigger: crear documento Word, generar .docx, documento de texto enriquecido
argument-hint: "[descripción del documento]"
license: MIT
metadata:
  author: flock
  version: '1.0'
  scope: [root]
  auto_invoke:
    - 'Crear documento Word'
    - 'Generar .docx'
    - 'Generar informe Word'
allowed-tools: Bash, Read, Write, Glob
context: fork
---

# Skill: Generar documento Word

## Critical Rules

### ALWAYS

- Verificar si existe `template.docx` antes de crear desde cero
- Mostrar el outline al usuario y esperar confirmación antes de generar
- Usar `python3`, nunca `python`
- Guardar el script temporal siempre en `/tmp/`
- Incluir portada, header y footer en todos los documentos
- Eliminar el script temporal después de ejecutarlo
- Aplicar la guía de estilos completa (paleta, tipografía, márgenes)

### NEVER

- Continuar al paso 5 sin confirmación explícita del paso 4
- Guardar scripts temporales en el directorio del proyecto
- Omitir portada, header o footer
- Cambiar la paleta de colores sin que el usuario lo pida
- Usar `python` en vez de `python3`

---

## 1. Verificar python-docx

```bash
python3 -c "import docx" 2>/dev/null && echo "OK" || pip3 install python-docx -q
```

## 2. Buscar template

Buscá si existe un `template.docx` en el directorio actual o raíz del proyecto:

```bash
find . -maxdepth 2 -name "template.docx" 2>/dev/null | head -1
```

- Si existe → usalo como base: `Document('ruta/template.docx')` — hereda estilos, fuentes y encabezados corporativos
- Si no existe → creá desde cero aplicando la guía de estilos de este skill

## 3. Entender el documento

Analizá `$ARGUMENTS`:

- Si hay descripción suficiente → continuá
- Si es vago o vacío → preguntá: título, secciones principales, tipo (informe, carta, propuesta, acta, etc.)
- Si el usuario menciona archivos de datos (CSV, JSON, Excel) → leélos con Read/Glob **antes** de continuar

## 4. Confirmar estructura antes de generar

Mostrá el outline al usuario y esperá confirmación explícita:

```
📄 Voy a generar: nombre_archivo.docx

Estructura:
  - Portada: [título, subtítulo, autor, fecha]
  - Sección 1: ...
  - Sección 2: ... (tabla con N columnas)
  - Sección 3: ...

¿Confirmás? (s/n)
```

No continúes sin respuesta afirmativa.

## 5. Generar el script Python

Escribí el script en `/tmp/gen_word_doc.py`. Aplicá **siempre** la guía de estilos completa:

```python
import os
from datetime import date as dt
from docx import Document
from docx.shared import Inches, Pt, RGBColor, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

# ── PALETA ──────────────────────────────────────────────────────────────────
COLOR_PRIMARY   = RGBColor(0x1F, 0x49, 0x7D)  # azul corporativo
COLOR_SECONDARY = RGBColor(0x2E, 0x74, 0xB5)  # azul claro
COLOR_TEXT      = RGBColor(0x26, 0x26, 0x26)  # casi negro
COLOR_SUBTLE    = RGBColor(0x75, 0x75, 0x75)  # gris

# ── TIPOGRAFÍA ───────────────────────────────────────────────────────────────
FONT_BODY    = "Calibri"
FONT_HEADING = "Calibri"
SIZE_BODY    = Pt(11)
SIZE_H1      = Pt(18)
SIZE_H2      = Pt(14)
SIZE_H3      = Pt(12)

# ── MÁRGENES ─────────────────────────────────────────────────────────────────
def set_margins(doc, top=2.54, bottom=2.54, left=3.0, right=2.54):
    for section in doc.sections:
        section.top_margin    = Cm(top)
        section.bottom_margin = Cm(bottom)
        section.left_margin   = Cm(left)
        section.right_margin  = Cm(right)

# ── PAGE SIZE ─────────────────────────────────────────────────────────────────
# Default: A4 (Argentina, Europa y resto del mundo).
# US Letter solo para documentos destinados a audiencias norteamericanas.
#   A4:        Cm(21.0)  x Cm(29.7)   ← default
#   US Letter: Cm(21.59) x Cm(27.94)
def set_page_size(doc, width=Cm(21.0), height=Cm(29.7)):
    for section in doc.sections:
        section.page_width  = width
        section.page_height = height

# ── HELPERS DE ESTILO ────────────────────────────────────────────────────────
def style_run(run, size=SIZE_BODY, color=COLOR_TEXT, bold=False, italic=False):
    run.font.name      = FONT_BODY
    run.font.size      = size
    run.font.color.rgb = color
    run.bold           = bold
    run.italic         = italic

def set_cell_bg(cell, hex_color):
    tc   = cell._tc
    tcPr = tc.get_or_add_tcPr()
    shd  = OxmlElement('w:shd')
    shd.set(qn('w:fill'),  hex_color)
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:val'),   'clear')
    tcPr.append(shd)

# ── PÁRRAFO CUERPO ───────────────────────────────────────────────────────────
def add_body_paragraph(doc, text, alignment=WD_ALIGN_PARAGRAPH.JUSTIFY):
    p   = doc.add_paragraph()
    run = p.add_run(text)
    style_run(run)
    p.alignment                          = alignment
    p.paragraph_format.space_after       = Pt(6)
    p.paragraph_format.line_spacing      = Pt(14)
    return p

# ── HEADING ──────────────────────────────────────────────────────────────────
def add_heading(doc, text, level=1):
    sizes  = {1: SIZE_H1,      2: SIZE_H2,        3: SIZE_H3}
    colors = {1: COLOR_PRIMARY, 2: COLOR_SECONDARY, 3: COLOR_SECONDARY}
    p   = doc.add_heading(text, level=level)
    for run in p.runs:
        run.font.name      = FONT_HEADING
        run.font.size      = sizes.get(level, SIZE_H2)
        run.font.color.rgb = colors.get(level, COLOR_PRIMARY)
        run.bold           = True
    p.paragraph_format.space_before = Pt(12)
    p.paragraph_format.space_after  = Pt(4)
    return p

# ── TABLA ────────────────────────────────────────────────────────────────────
# ⚠️  Compatibilidad: siempre usar WidthType.DXA para anchos de columna.
#     WidthType.PERCENTAGE falla en Google Docs, SharePoint y Word Online.
def add_styled_table(doc, headers, rows):
    table = doc.add_table(rows=1, cols=len(headers))
    table.style = "Table Grid"
    # Encabezado
    hdr_cells = table.rows[0].cells
    for i, h in enumerate(headers):
        hdr_cells[i].text = h
        run = hdr_cells[i].paragraphs[0].runs[0]
        style_run(run, size=Pt(10), color=RGBColor(0xFF, 0xFF, 0xFF), bold=True)
        set_cell_bg(hdr_cells[i], '1F497D')
    # Filas con sombreado alternado
    for idx, row_data in enumerate(rows):
        row   = table.add_row().cells
        color = 'DCE6F1' if idx % 2 == 0 else 'FFFFFF'
        for i, val in enumerate(row_data):
            row[i].text = str(val)
            run = row[i].paragraphs[0].runs[0]
            style_run(run, size=Pt(10))
            set_cell_bg(row[i], color)
    return table

# ── HEADER ───────────────────────────────────────────────────────────────────
def add_header(doc, title, company=""):
    header = doc.sections[0].header
    p      = header.paragraphs[0] if header.paragraphs else header.add_paragraph()
    p.clear()
    label  = f"{company}  |  {title}" if company else title
    run    = p.add_run(label)
    style_run(run, size=Pt(9), color=COLOR_SUBTLE, italic=True)
    p.alignment = WD_ALIGN_PARAGRAPH.RIGHT

# ── FOOTER CON NÚMERO DE PÁGINA ──────────────────────────────────────────────
def add_footer_with_page_number(doc):
    footer = doc.sections[0].footer
    p      = footer.paragraphs[0] if footer.paragraphs else footer.add_paragraph()
    p.clear()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run()
    style_run(run, size=Pt(9), color=COLOR_SUBTLE)
    for tag, text in [('begin', None), (None, 'PAGE'), ('end', None)]:
        if tag:
            el = OxmlElement('w:fldChar')
            el.set(qn('w:fldCharType'), tag)
        else:
            el = OxmlElement('w:instrText')
            el.text = text
        run._r.append(el)

# ── PORTADA ──────────────────────────────────────────────────────────────────
def add_cover_page(doc, title, subtitle="", author="", date=""):
    doc.add_paragraph()
    doc.add_paragraph()
    p = doc.add_paragraph()
    run = p.add_run(title)
    style_run(run, size=Pt(28), color=COLOR_PRIMARY, bold=True)
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(8)
    if subtitle:
        p = doc.add_paragraph()
        run = p.add_run(subtitle)
        style_run(run, size=Pt(16), color=COLOR_SECONDARY)
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_after = Pt(48)
    doc.add_paragraph()
    doc.add_paragraph()
    if author:
        p = doc.add_paragraph()
        run = p.add_run(author)
        style_run(run)
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p = doc.add_paragraph()
    run = p.add_run(date or dt.today().strftime("%d/%m/%Y"))
    style_run(run, size=Pt(10), color=COLOR_SUBTLE)
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    doc.add_page_break()

# ════════════════════════════════════════════════════════════════════════════
# DOCUMENTO (adaptar a partir de aquí según la solicitud del usuario)
# ════════════════════════════════════════════════════════════════════════════

template_path = None  # completar si se encontró template.docx
doc = Document(template_path) if template_path else Document()

set_page_size(doc)          # A4 por defecto — US Letter: set_page_size(doc, Cm(21.59), Cm(27.94))
set_margins(doc)
doc.core_properties.author = "Claude"
doc.core_properties.title  = "Título del documento"

add_cover_page(doc, title="TÍTULO", subtitle="Subtítulo", author="Autor")
add_header(doc, title="TÍTULO")
add_footer_with_page_number(doc)

# --- contenido del documento ---

output_path = "nombre_del_archivo.docx"
doc.save(output_path)
print(f"✓ {os.path.abspath(output_path)}")
```

## 6. Ejecutar y limpiar

```bash
python3 /tmp/gen_word_doc.py && rm /tmp/gen_word_doc.py
```

Verificá que el archivo fue creado:

```bash
ls -lh nombre_del_archivo.docx
```

## 7. Informar al usuario

Respondé con:
- Ruta absoluta del archivo generado y su tamaño
- Resumen de la estructura (secciones, tablas, páginas estimadas)
- Confirmación de que el script temporal fue eliminado

## Professional Document Base

Esqueleto mínimo recomendado — punto de partida copy-paste para cualquier documento:

```python
doc = Document()

# Page size: A4 por defecto (Argentina, Europa y resto del mundo)
set_page_size(doc)
# US Letter solo para audiencias norteamericanas:
# set_page_size(doc, width=Cm(21.59), height=Cm(27.94))

# Márgenes explícitos
set_margins(doc, top=2.54, bottom=2.54, left=3.0, right=2.54)

# Header: título + empresa con tab stop alineado a la derecha
add_header(doc, title="Título del Documento", company="Empresa S.A.")

# Footer: número de página centrado
add_footer_with_page_number(doc)

# Estilo base de fuente (Arial, 11pt cuerpo)
FONT_BODY    = "Arial"
FONT_HEADING = "Arial"
SIZE_BODY    = Pt(11)

# Portada
add_cover_page(doc,
    title    = "Título del Documento",
    subtitle = "Subtítulo o descripción",
    author   = "Nombre Apellido",
    date     = "Marzo 2026"
)

doc.core_properties.title  = "Título del Documento"
doc.core_properties.author = "Nombre Apellido"

# --- contenido a partir de aquí ---

doc.save("documento.docx")
print(f"✓ {os.path.abspath('documento.docx')}")
```

## Notas

- Siempre usá `python3`, nunca `python`
- El script temporal va **siempre en `/tmp/`**, nunca en el directorio del proyecto
- Si hay datos externos (CSV, JSON), leélos con Read/Glob **antes** de escribir el script
- Nunca omitir portada, header o footer
- La paleta de colores es fija — solo cambiala si el usuario pide branding propio
- No continúes al paso 5 sin confirmación explícita del paso 4
- **Page size**: usar A4 (`Cm(21.0) x Cm(29.7)`) por defecto. US Letter (`Cm(21.59) x Cm(27.94)`) solo para documentos destinados a audiencias norteamericanas
- **Ancho de columnas en tablas**: siempre usar `WidthType.DXA` — `WidthType.PERCENTAGE` falla en Google Docs, SharePoint y Word Online

---

## Leer y Analizar Documentos Existentes

Para extraer texto de un `.docx` existente antes de editarlo:

```bash
# Extracción de texto con tracked changes incluidos
pandoc --track-changes=all documento.docx -o output.md

# Convertir .doc a .docx (formato legacy)
python scripts/office/soffice.py --headless --convert-to docx documento.doc
```

---

## Tracked Changes

Para documentos que necesitan revisión con cambios rastreados, editar el XML directamente:

```bash
# Desempacar el .docx (es un ZIP con XML)
python scripts/office/unpack.py documento.docx unpacked/

# Editar archivos en unpacked/word/
# Reempacar
python scripts/office/pack.py unpacked/ output.docx --original documento.docx
```

**Patrón de tracked changes en XML:**

```xml
<!-- Inserción -->
<w:ins w:id="1" w:author="Claude" w:date="2025-01-01T00:00:00Z">
  <w:r><w:t>texto insertado</w:t></w:r>
</w:ins>

<!-- Eliminación -->
<w:del w:id="2" w:author="Claude" w:date="2025-01-01T00:00:00Z">
  <w:r><w:delText>texto eliminado</w:delText></w:r>
</w:del>

<!-- Cambio mínimo: "30 días" → "60 días" -->
<w:r><w:t>El plazo es </w:t></w:r>
<w:del w:id="1" w:author="Claude" w:date="...">
  <w:r><w:delText>30</w:delText></w:r>
</w:del>
<w:ins w:id="2" w:author="Claude" w:date="...">
  <w:r><w:t>60</w:t></w:r>
</w:ins>
<w:r><w:t> días.</w:t></w:r>
```

**Reglas críticas para tracked changes:**
- Usar `"Claude"` como autor siempre (a menos que el usuario pida otro nombre)
- Reemplazar el bloque `<w:r>` completo, nunca inyectar tags dentro de un run
- Preservar `<w:rPr>` del run original para mantener bold, tamaño, etc.
- Para eliminar párrafos completos: agregar `<w:del/>` dentro de `<w:pPr><w:rPr>` también

---

## Comentarios

Usar el script `comment.py` para agregar comentarios sin boilerplate manual:

```bash
# Agregar comentario
python scripts/comment.py unpacked/ 0 "Texto del comentario"

# Responder a comentario existente
python scripts/comment.py unpacked/ 1 "Respuesta" --parent 0

# Con autor personalizado
python scripts/comment.py unpacked/ 0 "Texto" --author "Revisor"
```

Luego agregar los markers en `document.xml`:

```xml
<!-- Los markers son hermanos de <w:r>, NUNCA dentro de <w:r> -->
<w:commentRangeStart w:id="0"/>
<w:r><w:t>texto comentado</w:t></w:r>
<w:commentRangeEnd w:id="0"/>
<w:r>
  <w:rPr><w:rStyle w:val="CommentReference"/></w:rPr>
  <w:commentReference w:id="0"/>
</w:r>
```

---

## Aceptar Tracked Changes

Para producir un documento limpio con todos los cambios aceptados:

```bash
python scripts/accept_changes.py input.docx output.docx
```
