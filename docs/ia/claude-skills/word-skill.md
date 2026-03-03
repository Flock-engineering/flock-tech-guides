---
id: word-skill
title: "Claude Skill: Generar documentos Word"
sidebar_label: "Word Skill"
---

# Claude Skill: Generar documentos Word

Un **Claude Skill** es una instrucción persistente que le dice a Claude Code cómo ejecutar una tarea específica. Se invoca con `/nombre-del-skill` desde la terminal o el IDE, y Claude lo sigue como guía de ejecución.

Este skill automatiza la generación de archivos `.docx` usando Python y la librería `python-docx`, con estilos corporativos, portada, header/footer y soporte de templates.

## ¿Cómo se usa?

```bash
/word-doc informe mensual de ventas con tabla de datos
/word-doc carta de presentación para empresa de tecnología
/word-doc    # sin argumentos → Claude pregunta los detalles
```

Al invocarlo, Claude:

1. Verifica si `python-docx` está instalado (lo instala si no)
2. Busca un `template.docx` en el proyecto para reutilizar estilos
3. Analiza la descripción y, si es vaga, pregunta los detalles
4. **Muestra el outline del documento y espera confirmación antes de generar**
5. Genera y ejecuta el script Python en `/tmp/` (lo borra al terminar)
6. Produce el `.docx` en el directorio actual
7. Informa la ruta absoluta y tamaño del archivo generado

### Invocación automática

No siempre hace falta escribir `/word-doc`. Claude Code lee el campo `description` del skill y **lo activa solo** cuando infiere que la intención es generar un Word. Por ejemplo, frases como:

> *"Haceme un informe en Word"*, *"Exportá esto como documento Word"*, *"Generame un .docx con..."*

...hacen que Claude seleccione el skill automáticamente sin que tengas que recordar el nombre del comando.

## Guía de estilos incorporada

El skill aplica siempre los mismos estándares visuales para mantener consistencia entre documentos.

### Tipografía

| Elemento | Fuente | Tamaño |
|---|---|---|
| Cuerpo | Calibri | 11pt |
| Heading 1 | Calibri Bold | 18pt |
| Heading 2 | Calibri Bold | 14pt |
| Heading 3 | Calibri Bold | 12pt |
| Header/Footer | Calibri | 9pt |

Interlineado: 1.15 · Espaciado post-párrafo: 6pt

### Paleta de colores

| Uso | Color | Hex |
|---|---|---|
| Headings principales, encabezado de tablas | Azul corporativo | `#1F497D` |
| Headings secundarios, acentos | Azul claro | `#2E74B5` |
| Cuerpo de texto | Casi negro | `#262626` |
| Header, footer, metadatos | Gris | `#757575` |

### Márgenes

| Lado | Valor |
|---|---|
| Izquierdo | 3.0 cm |
| Derecho, superior, inferior | 2.54 cm |

## Elementos soportados

| Elemento | Descripción |
|---|---|
| **Portada** | Título, subtítulo, autor y fecha centrados con estilos tipográficos |
| **Header** | Nombre del documento (y empresa opcional) alineado a la derecha |
| **Footer** | Número de página centrado con campo XML nativo de Word |
| **Títulos** | Heading 1 a 3 con colores y tamaños de la guía de estilos |
| **Párrafos** | Texto justificado con interlineado y espaciado definidos |
| **Formato inline** | Negrita, cursiva, subrayado, color, tamaño de fuente |
| **Listas** | Con viñetas o numeradas |
| **Tablas** | Encabezado con fondo azul, filas con sombreado alternado |
| **Imágenes** | Inserción desde archivo local con ancho configurable |
| **Saltos de página** | Separación de secciones |
| **Metadatos** | Autor y título en propiedades del documento |

## Soporte de template

Si el proyecto tiene un `template.docx`, el skill lo detecta automáticamente y lo usa como base:

```bash
# El skill busca aquí:
./template.docx
```

Esto permite heredar estilos corporativos, logos en headers y cualquier configuración preexistente sin redefinirlos en el script.

## Confirmación antes de generar

Para documentos con más de una sección, el skill siempre muestra el outline primero:

```
📄 Voy a generar: informe_ventas_q1.docx

Estructura:
  - Portada: Informe de Ventas Q1, autor, fecha
  - Resumen Ejecutivo
  - Resultados por Región (tabla: Región | Ventas | Variación)
  - Conclusiones

¿Confirmás? (s/n)
```

Esto evita generar documentos incorrectos en solicitudes ambiguas.

## Ejemplo de código generado

Para `/word-doc informe de ventas Q1`, Claude genera algo así:

```python
from docx import Document
from docx.shared import Pt, RGBColor, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH

# ... helpers de estilo (paleta, fuentes, márgenes) ...

doc = Document()
set_margins(doc)
doc.core_properties.author = "Claude"
doc.core_properties.title  = "Informe de Ventas Q1"

add_cover_page(doc, title="Informe de Ventas Q1",
               subtitle="Primer trimestre 2025", author="Equipo Comercial")
add_header(doc, title="Informe de Ventas Q1")
add_footer_with_page_number(doc)

add_heading(doc, "Resumen Ejecutivo", level=1)
add_body_paragraph(doc, "Este informe presenta los resultados del primer trimestre...")

add_heading(doc, "Resultados por Región", level=1)
add_styled_table(doc,
    headers=["Región", "Ventas", "Variación"],
    rows=[
        ("Norte", "$120.000", "+12%"),
        ("Sur",   "$98.000",  "+5%"),
    ]
)

doc.save("informe_ventas_q1.docx")
```

El script se ejecuta desde `/tmp/` y se elimina automáticamente al terminar.

## ¿Dónde instalar el skill?

| Alcance | Ruta |
|---|---|
| **Personal** (todos los proyectos) | `~/.claude/skills/word-doc/SKILL.md` |
| **Proyecto** (solo este repo) | `.claude/skills/word-doc/SKILL.md` |

## Instalación rápida: pedíselo a Claude

No necesitás crear el archivo manualmente. Abrí Claude Code en la terminal y pegá este mensaje:

```
Instalame el skill word-doc en ~/.claude/skills/word-doc/SKILL.md con las
siguientes instrucciones:

- Verificar python-docx antes de ejecutar
- Buscar template.docx en el proyecto y usarlo si existe
- Pedir detalles si la descripción es vaga
- Mostrar el outline del documento y esperar confirmación antes de generar
- Aplicar guía de estilos: Calibri 11pt, paleta azul corporativo (#1F497D),
  márgenes 3cm izquierdo y 2.54cm resto, interlineado 1.15
- Generar siempre portada, header con título y footer con número de página
- Ejecutar el script desde /tmp/ y borrarlo al terminar
- Informar la ruta absoluta y tamaño del archivo generado
```

Claude va a crear el archivo, confirmar la instalación, y el skill quedará listo para usar de inmediato.

## Nivel de aplicación

**Tipo:** Manual o automático por inferencia | **Nivel:** Intermedio
