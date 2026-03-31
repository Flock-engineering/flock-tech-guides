---
id: brand-guidelines-skill
title: "Claude Skill: Brand Guidelines de Anthropic"
sidebar_label: "Brand Guidelines"
---

# Claude Skill: Brand Guidelines de Anthropic

Skill que guía a Claude para **aplicar los colores y tipografía oficiales de Anthropic** a cualquier artefacto visual — presentaciones, documentos, reportes o cualquier output que se beneficie del look-and-feel corporativo.

:::tip Descarga el skill
<a href="/flock-tech-guides/skills/brand-guidelines/SKILL.md" download="SKILL.md">⬇ Descargar SKILL.md</a> — guardalo en `~/.claude/skills/brand-guidelines/SKILL.md` para instalarlo directamente.
:::

## ¿Qué hace?

Cuando Claude genera o estiliza un artefacto visual, este skill le indica:

- Usar la **paleta oficial de Anthropic** — colores primarios y de acento con valores RGB exactos
- Aplicar **Poppins** para headings y **Lora** para cuerpo de texto
- Hacer fallback automático a Arial/Georgia si las fuentes no están instaladas
- Ciclar los colores de acento (naranja, azul, verde) en formas y elementos no textuales
- Mantener la jerarquía visual y el contraste adecuado en todos los sistemas

## ¿Cuándo se activa?

Claude lo invoca automáticamente al detectar:

> *"Aplicar brand de Anthropic"*, *"Usar colores corporativos"*, *"Estilizar con guidelines"*, *"Formatear con la identidad visual"*, *"Aplicar branding"*

## Paleta de colores

### Colores principales

| Color | Hex | Uso |
|---|---|---|
| Dark | `#141413` | Texto primario y fondos oscuros |
| Light | `#faf9f5` | Fondos claros y texto sobre oscuro |
| Mid Gray | `#b0aea5` | Elementos secundarios |
| Light Gray | `#e8e6dc` | Fondos sutiles |

### Colores de acento

| Color | Hex | Jerarquía |
|---|---|---|
| Orange | `#d97757` | Acento primario |
| Blue | `#6a9bcc` | Acento secundario |
| Green | `#788c5d` | Acento terciario |

## Tipografía

| Uso | Fuente | Fallback |
|---|---|---|
| Headings (24pt+) | Poppins | Arial |
| Cuerpo de texto | Lora | Georgia |

## Cobertura de herramientas

| Herramienta | Propósito |
|---|---|
| **python-pptx** | Aplicación de colores RGB en presentaciones |
| **python-docx** | Estilizado de documentos Word |
| **Sistema de fuentes** | Detección y fallback automático |

## Instalación rápida

1. Descargá el `SKILL.md` con el botón de arriba
2. Abrí Claude Code en tu terminal
3. Adjuntá el archivo y enviá:

> *"Instalá este skill en `~/.claude/skills/brand-guidelines/SKILL.md`"*

## Nivel de aplicación

**Tipo:** Automático por inferencia | **Nivel:** Básico | **Artefactos:** Presentaciones, documentos, reportes
