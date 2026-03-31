---
id: pdf-skill
title: "Claude Skill: PDF"
sidebar_label: "PDF"
---

# Claude Skill: PDF

Skill que guía a Claude para **leer, crear, combinar, dividir, rotar, marcar con watermark, encriptar y extraer contenido de archivos PDF**, usando `pypdf`, `pdfplumber`, `reportlab` y herramientas de línea de comando como `qpdf`.

:::tip Descarga el skill
<a href="/flock-tech-guides/skills/pdf/SKILL.md" download="SKILL.md">⬇ Descargar SKILL.md</a> — guardalo en `~/.claude/skills/pdf/SKILL.md` para instalarlo directamente.
:::

## ¿Qué hace?

Cuando Claude trabaja con PDFs, este skill le indica cómo:

- **Leer y extraer texto** con `pdfplumber` preservando layout y estructura
- **Extraer tablas** de PDFs directamente a DataFrames o Excel
- **Crear PDFs** desde cero con `reportlab` (Canvas o Platypus para multi-página)
- **Combinar y dividir** archivos con `pypdf` o `qpdf`
- **Rotar páginas**, agregar watermarks y proteger con contraseña
- **OCR en PDFs escaneados** convirtiendo a imágenes y procesando con `pytesseract`
- **Extraer imágenes** usando herramientas de poppler (`pdfimages`)
- Usar `<sub>` y `<super>` en lugar de caracteres Unicode para subíndices/superíndices (los fonts built-in no los soportan)

## ¿Cuándo se activa?

Claude lo invoca automáticamente al detectar cualquier mención de archivos `.pdf` o pedidos relacionados:

> *"Extraer texto de un PDF"*, *"Combinar PDFs"*, *"Crear un PDF"*, *"Rotar páginas"*, *"OCR de PDF escaneado"*, *"Agregar watermark"*, *"Proteger con contraseña"*

## Capacidades

| Tarea | Herramienta |
|---|---|
| Extraer texto con layout | `pdfplumber` |
| Extraer tablas | `pdfplumber` + `pandas` |
| Combinar PDFs | `pypdf` / `qpdf` |
| Dividir PDFs | `pypdf` / `qpdf` |
| Crear PDFs nuevos | `reportlab` |
| Rotar páginas | `pypdf` / `qpdf` |
| Watermark | `pypdf` (merge_page) |
| Encriptar/desencriptar | `pypdf` / `qpdf` |
| OCR en escaneados | `pytesseract` + `pdf2image` |
| Extraer imágenes | `pdfimages` (poppler) |
| CLI general | `qpdf`, `pdftk`, `pdftotext` |

## Patrones principales

### Extraer texto
```python
import pdfplumber
with pdfplumber.open("documento.pdf") as pdf:
    for page in pdf.pages:
        print(page.extract_text())
```

### Combinar PDFs
```python
from pypdf import PdfWriter, PdfReader
writer = PdfWriter()
for f in ["doc1.pdf", "doc2.pdf"]:
    for page in PdfReader(f).pages:
        writer.add_page(page)
with open("merged.pdf", "wb") as out:
    writer.write(out)
```

### Crear PDF multi-página
```python
from reportlab.platypus import SimpleDocTemplate, Paragraph
from reportlab.lib.styles import getSampleStyleSheet
doc = SimpleDocTemplate("reporte.pdf")
doc.build([Paragraph("Contenido", getSampleStyleSheet()['Normal'])])
```

## Instalación rápida

1. Descargá el `SKILL.md` con el botón de arriba
2. Abrí Claude Code en tu terminal
3. Adjuntá el archivo y enviá:

> *"Instalá este skill en `~/.claude/skills/pdf/SKILL.md`"*

## Nivel de aplicación

**Tipo:** Automático por detección de `.pdf` | **Nivel:** Intermedio | **Formato:** `.pdf`
