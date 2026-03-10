---
name: excel
description: >
  Genera planillas Excel (.xlsx) con estilo profesional y compatibilidad con SharePoint y Excel Online.
  Trigger: crear planilla Excel, generar .xlsx, crear reporte Excel, crear tabla Excel
argument-hint: "[descripción de la planilla]"
license: MIT
metadata:
  author: flock
  version: '1.0'
  scope: [root]
  auto_invoke:
    - 'Crear planilla Excel'
    - 'Generar .xlsx'
    - 'Crear reporte Excel'
    - 'Crear tabla Excel'
    - 'Generar planilla'
allowed-tools: Bash, Read, Write, Glob
context: fork
---

# Skill: Generar planilla Excel

## Critical Rules

### ALWAYS

- Usar **`.xlsx`** siempre — nunca `.xls`, `.xlsm` ni `.xlsb`
- Mostrar el outline al usuario y esperar confirmación antes de generar
- Usar `python3`, nunca `python`
- Guardar el script temporal siempre en `/tmp/`
- Eliminar el script temporal después de ejecutarlo
- Usar **`Table` nativo de openpyxl** para tablas — garantiza compatibilidad con SharePoint y Excel Online
- Aplicar `freeze_panes` en la fila de headers
- Page setup A4 por defecto
- Autofit de columnas siempre

### NEVER

- Continuar al paso 5 sin confirmación explícita del paso 4
- Guardar scripts temporales en el directorio del proyecto
- Usar macros, VBA ni fórmulas con conexiones externas — no compatibles en SharePoint
- Usar `WidthType.PERCENTAGE` ni anchos relativos — usar ancho fijo en caracteres
- Usar fuentes no estándar — solo Calibri o Arial (Excel Online no soporta fuentes embebidas)
- Usar charts 3D — no renderizan correctamente en Excel Online
- Usar `python` en vez de `python3`

---

## SharePoint / Excel Online — Compatibilidad

| Feature | Soporte | Nota |
|---|---|---|
| `.xlsx` | ✅ Completo | Único formato recomendado |
| Tablas nativas (`Table`) | ✅ Completo | Usar siempre para rangos de datos |
| Freeze panes | ✅ Completo | Funciona en Excel Online |
| Conditional formatting | ✅ Completo | Soportado |
| Named ranges | ✅ Completo | Soportado |
| Charts básicos (bar, line, pie) | ✅ Mayormente | Evitar 3D |
| Imágenes | ⚠️ Parcial | Funciona pero puede variar en Online |
| Macros / VBA | ❌ No | Bloqueado en SharePoint por seguridad |
| Conexiones externas | ❌ No | No soportado en Online |
| Fuentes embebidas | ❌ No | Usar Calibri o Arial |

---

## 1. Verificar openpyxl

```bash
python3 -c "import openpyxl" 2>/dev/null && echo "OK" || pip3 install openpyxl -q
```

## 2. Entender la planilla

Analizá `$ARGUMENTS`:

- Si hay descripción suficiente → continuá
- Si es vago o vacío → preguntá: nombre de la planilla, hojas necesarias, columnas, tipo de datos (texto, número, fecha, moneda), si necesita fórmulas
- Si el usuario menciona archivos de datos (CSV, JSON, Excel) → leélos con Read/Glob **antes** de continuar

## 3. Confirmar estructura antes de generar

Mostrá el outline al usuario y esperá confirmación explícita:

```
📊 Voy a generar: nombre_planilla.xlsx

Hojas:
  - Hoja "Datos": tabla con columnas [A, B, C] — N filas
  - Hoja "Resumen": tabla pivot con totales por [X]

Configuración:
  - Page size: A4 landscape
  - Headers congelados: sí
  - Formato de moneda: $ ARS

¿Confirmás? (s/n)
```

No continúes sin respuesta afirmativa.

## 4. Generar el script Python

Escribí el script en `/tmp/gen_excel.py`. Aplicá **siempre** la guía de estilos completa:

```python
import os
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.table import Table, TableStyleInfo
from openpyxl.worksheet.page import PageMargins

# ── PALETA ────────────────────────────────────────────────────────────────────
COLOR_HEADER  = "1F497D"  # azul corporativo — header de tablas
COLOR_SUBHDR  = "2E74B5"  # azul claro — subheaders
COLOR_ROW_ALT = "DCE6F1"  # azul muy claro — filas alternadas
COLOR_WHITE   = "FFFFFF"
COLOR_TEXT    = "262626"  # casi negro

# ── TIPOGRAFÍA ─────────────────────────────────────────────────────────────────
FONT_NAME  = "Calibri"
SIZE_BODY  = 11
SIZE_HDR   = 11
SIZE_TITLE = 16

# ── ESTILOS ───────────────────────────────────────────────────────────────────
def hdr_font(size=SIZE_HDR, color=COLOR_WHITE):
    return Font(name=FONT_NAME, bold=True, size=size, color=color)

def body_font(bold=False, size=SIZE_BODY, color=COLOR_TEXT):
    return Font(name=FONT_NAME, bold=bold, size=size, color=color)

def fill(hex_color):
    return PatternFill(fill_type="solid", fgColor=hex_color)

def align(horizontal="left", wrap=True):
    return Alignment(horizontal=horizontal, vertical="center", wrap_text=wrap)

def thin_border():
    s = Side(style="thin", color="BFBFBF")
    return Border(left=s, right=s, top=s, bottom=s)

# ── TABLA ESTILIZADA ──────────────────────────────────────────────────────────
# ⚠️  Usar siempre Table nativo — compatible con SharePoint y Excel Online.
#     No usar anchos de columna en porcentaje — usar ancho fijo en caracteres.
def add_styled_table(ws, headers, rows, start_row=1, start_col=1, table_name="Tabla1"):
    # Header
    for ci, h in enumerate(headers, start=start_col):
        c = ws.cell(row=start_row, column=ci, value=h)
        c.font      = hdr_font()
        c.fill      = fill(COLOR_HEADER)
        c.alignment = align("center")
        c.border    = thin_border()

    # Rows
    for ri, row_data in enumerate(rows, start=start_row + 1):
        row_color = COLOR_ROW_ALT if (ri - start_row) % 2 == 0 else COLOR_WHITE
        for ci, value in enumerate(row_data, start=start_col):
            c = ws.cell(row=ri, column=ci, value=value)
            c.font      = body_font()
            c.fill      = fill(row_color)
            c.alignment = align("left")
            c.border    = thin_border()

    # Registrar como Table nativo (requerido para SharePoint / Excel Online)
    end_row = start_row + len(rows)
    end_col = start_col + len(headers) - 1
    ref     = f"{get_column_letter(start_col)}{start_row}:{get_column_letter(end_col)}{end_row}"
    tbl     = Table(displayName=table_name, ref=ref)
    tbl.tableStyleInfo = TableStyleInfo(
        name="TableStyleMedium2",
        showRowStripes=True,
        showColumnStripes=False,
    )
    ws.add_table(tbl)
    return tbl

# ── TÍTULO DE HOJA ─────────────────────────────────────────────────────────────
def add_sheet_title(ws, title, row=1, col=1):
    c = ws.cell(row=row, column=col, value=title)
    c.font      = Font(name=FONT_NAME, bold=True, size=SIZE_TITLE, color=COLOR_HEADER)
    c.alignment = align("left", wrap=False)
    ws.row_dimensions[row].height = 28

# ── PAGE SETUP ─────────────────────────────────────────────────────────────────
def setup_page(ws, landscape=True):
    """A4 por defecto — compatible con print preview en SharePoint"""
    ws.page_setup.paperSize   = ws.PAPERSIZE_A4
    ws.page_setup.orientation = ws.ORIENTATION_LANDSCAPE if landscape else ws.ORIENTATION_PORTRAIT
    ws.page_margins           = PageMargins(left=0.75, right=0.75, top=1.0, bottom=1.0)
    ws.page_setup.fitToPage   = True
    ws.page_setup.fitToWidth  = 1
    ws.page_setup.fitToHeight = 0

# ── FREEZE PANES ───────────────────────────────────────────────────────────────
def freeze_header(ws, freeze_row=2, freeze_col=1):
    """Congela headers — funciona en SharePoint y Excel Online"""
    ws.freeze_panes = ws.cell(row=freeze_row, column=freeze_col)

# ── AUTOFIT COLUMNAS ───────────────────────────────────────────────────────────
def autofit_columns(ws, min_width=10, max_width=40):
    for col in ws.columns:
        max_len = max((len(str(cell.value or "")) for cell in col), default=0)
        ws.column_dimensions[col[0].column_letter].width = max(min_width, min(max_len + 2, max_width))

# ════════════════════════════════════════════════════════════════════════════════
# PLANILLA (adaptar a partir de aquí según la solicitud del usuario)
# ════════════════════════════════════════════════════════════════════════════════

wb = Workbook()
ws = wb.active
ws.title = "Datos"

setup_page(ws)
freeze_header(ws)

# --- contenido de la planilla ---

autofit_columns(ws)

output_path = "planilla.xlsx"
wb.save(output_path)
print(f"✓ {os.path.abspath(output_path)}")
```

## 5. Ejecutar y limpiar

```bash
python3 /tmp/gen_excel.py && rm /tmp/gen_excel.py
```

Verificá que el archivo fue creado:

```bash
ls -lh planilla.xlsx
```

## 6. Informar al usuario

Respondé con:
- Ruta absoluta del archivo generado y su tamaño
- Resumen de la estructura (hojas, tablas, filas, fórmulas)
- Confirmación de que el script temporal fue eliminado

---

## Professional Spreadsheet Base

Esqueleto mínimo recomendado — punto de partida copy-paste para cualquier planilla:

```python
wb = Workbook()
ws = wb.active
ws.title = "Datos"

# Page setup: A4 landscape (default para reportes)
setup_page(ws, landscape=True)
# Portrait para planillas verticales largas:
# setup_page(ws, landscape=False)

# Título de la hoja
add_sheet_title(ws, title="Título del Reporte", row=1)

# Tabla de datos (empieza en fila 2 para dejar espacio al título)
headers = ["Columna A", "Columna B", "Columna C"]
rows    = [
    ["Valor 1", 100, "2026-03-10"],
    ["Valor 2", 200, "2026-03-11"],
]
add_styled_table(ws, headers, rows, start_row=2, table_name="TablaReporte")

# Congelar headers (fila 2 = encabezado de la tabla)
freeze_header(ws, freeze_row=3)

# Autofit al final, después de cargar todos los datos
autofit_columns(ws)

wb.save("reporte.xlsx")
print(f"✓ {os.path.abspath('reporte.xlsx')}")
```

---

## Formatos de Celda Comunes

```python
from openpyxl.styles import numbers

# Moneda ARS
cell.number_format = '"$"#,##0.00'

# Moneda USD
cell.number_format = '"USD "#,##0.00'

# Porcentaje
cell.number_format = '0.00%'

# Fecha
cell.number_format = 'DD/MM/YYYY'

# Número con separador de miles
cell.number_format = '#,##0'
```

---

## Múltiples Hojas

```python
wb = Workbook()

# Hoja 1 — datos
ws_data = wb.active
ws_data.title = "Datos"
setup_page(ws_data)

# Hoja 2 — resumen
ws_summary = wb.create_sheet(title="Resumen")
setup_page(ws_summary)

# Hoja de índice — siempre primera
ws_index = wb.create_sheet(title="Índice", index=0)
```

---

## Notas

- Siempre usá `python3`, nunca `python`
- El script temporal va **siempre en `/tmp/`**, nunca en el directorio del proyecto
- Si hay datos externos (CSV, JSON), leélos con Read/Glob **antes** de escribir el script
- Guardar siempre como `.xlsx` — es el único formato compatible con SharePoint sin restricciones
- Los `table_name` en `Table` deben ser únicos por workbook y sin espacios
- `autofit_columns` llamarlo **siempre al final**, después de cargar todos los datos
- Freeze panes: `freeze_row` debe apuntar a la **primera fila de datos**, no al header
- No continúes al paso 4 sin confirmación explícita del paso 3
