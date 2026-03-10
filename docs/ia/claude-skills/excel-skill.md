---
id: excel-skill
title: "Claude Skill: Planillas Excel"
sidebar_label: "Excel Skill"
---

# Claude Skill: Planillas Excel

Skill que guía a Claude para generar **planillas `.xlsx` con estilo profesional y compatibilidad garantizada con SharePoint y Excel Online**, usando `openpyxl` con tablas nativas, freeze panes y page setup A4.

:::tip Descarga el skill
<a href="/flock-tech-guides/skills/excel/SKILL.md" download="SKILL.md">⬇ Descargar SKILL.md</a> — guardalo en `~/.claude/skills/excel/SKILL.md` para instalarlo directamente.
:::

## ¿Qué hace?

Cuando Claude genera una planilla Excel, este skill le indica:

- Usar siempre **`.xlsx`** — el único formato sin restricciones en SharePoint
- Usar **`Table` nativo de openpyxl** para rangos de datos — renderiza correctamente en Excel Online
- Aplicar la **paleta corporativa**: header azul (`1F497D`), filas alternadas en azul claro, fuente Calibri
- Configurar **page setup A4** (landscape por defecto) compatible con print preview en SharePoint
- Aplicar **freeze panes** en la fila de headers automáticamente
- **Autofit de columnas** siempre al final, después de cargar todos los datos
- Confirmar la estructura (hojas, columnas, tipos de datos) antes de generar
- Soportar **múltiples hojas**, formatos de celda (moneda, fecha, %) y título por hoja

## ¿Cuándo se activa?

Claude lo invoca automáticamente al detectar:

> *"Crear planilla Excel"*, *"Generar .xlsx"*, *"Crear reporte Excel"*, *"Crear tabla Excel"*, *"Generar planilla"*

## Compatibilidad SharePoint / Excel Online

| Feature | Soporte |
|---|---|
| `.xlsx` | ✅ Completo |
| Tablas nativas (`Table`) | ✅ Completo |
| Freeze panes | ✅ Completo |
| Conditional formatting | ✅ Completo |
| Charts básicos (bar, line, pie) | ✅ Mayormente — evitar 3D |
| Macros / VBA | ❌ Bloqueado por SharePoint |
| Conexiones externas | ❌ No soportado en Online |
| Fuentes embebidas | ❌ Solo Calibri / Arial |

## Patrones principales

### Tabla estilizada

```python
add_styled_table(ws, headers, rows, start_row=2, table_name="TablaReporte")
```

Genera una tabla con header azul corporativo, filas alternadas y bordes — registrada como `Table` nativo de Excel para compatibilidad con SharePoint.

### Formatos de celda

```python
cell.number_format = '"$"#,##0.00'   # moneda ARS
cell.number_format = '0.00%'          # porcentaje
cell.number_format = 'DD/MM/YYYY'     # fecha
```

### Múltiples hojas

```python
ws_data    = wb.active
ws_summary = wb.create_sheet(title="Resumen")
ws_index   = wb.create_sheet(title="Índice", index=0)
```

## Cobertura de herramientas

| Herramienta | Propósito |
|---|---|
| **openpyxl** | Generación de `.xlsx` con estilos, tablas y page setup |
| **SharePoint** | Destino principal — compatibilidad garantizada con `.xlsx` + `Table` |
| **Excel Online** | Visualización y edición en browser sin instalación |
| **Excel Desktop** | Apertura completa con todos los features |

## Instalación rápida

1. Descargá el `SKILL.md` con el botón de arriba
2. Abrí Claude Code en tu terminal
3. Adjuntá el archivo y enviá:

> *"Instalá este skill en `~/.claude/skills/excel/SKILL.md`"*

## Nivel de aplicación

**Tipo:** Automático por inferencia | **Nivel:** Intermedio | **Formato:** `.xlsx` | **SharePoint:** ✅
