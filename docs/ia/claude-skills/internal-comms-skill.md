---
id: internal-comms-skill
title: "Claude Skill: Comunicaciones Internas"
sidebar_label: "Internal Comms"
---

# Claude Skill: Comunicaciones Internas

Skill que guía a Claude para **redactar comunicaciones internas** en los formatos que usa tu empresa — updates de equipo, newsletters, reportes de incidentes, actualizaciones de proyecto y más.

:::tip Descarga el skill
<a href="/flock-tech-guides/skills/internal-comms/SKILL.md" download="SKILL.md">⬇ Descargar SKILL.md</a> — guardalo en `~/.claude/skills/internal-comms/SKILL.md` para instalarlo directamente.
:::

## ¿Qué hace?

Cuando Claude necesita redactar una comunicación interna, este skill le indica:

- Identificar el **tipo de comunicación** antes de escribir nada
- Cargar el archivo de guidelines correspondiente desde el directorio `examples/`
- Seguir las instrucciones específicas de **formato, tono y contenido** para cada tipo
- Preguntar por contexto adicional si el tipo no encaja en ninguna categoría existente

## ¿Cuándo se activa?

Claude lo invoca automáticamente al detectar:

> *"Escribir un 3P update"*, *"Redactar newsletter"*, *"Preparar update de liderazgo"*, *"Escribir reporte de incidente"*, *"Actualización de proyecto"*, *"Responder FAQs"*

## Tipos de comunicación soportados

| Tipo | Archivo de guidelines | Descripción |
|---|---|---|
| **3P Updates** | `examples/3p-updates.md` | Progress, Plans, Problems — updates de equipo |
| **Company Newsletter** | `examples/company-newsletter.md` | Newsletter para toda la empresa |
| **FAQ Responses** | `examples/faq-answers.md` | Respuestas a preguntas frecuentes |
| **General Comms** | `examples/general-comms.md` | Cualquier otro tipo de comunicación |

## Flujo de uso

1. Claude identifica el tipo de comunicación desde el pedido
2. Carga el archivo de guidelines correspondiente
3. Sigue el formato y tono definido en ese archivo
4. Si el tipo no matchea con ninguno, pide clarificación

## Instalación rápida

1. Descargá el `SKILL.md` con el botón de arriba
2. Abrí Claude Code en tu terminal
3. Adjuntá el archivo y enviá:

> *"Instalá este skill en `~/.claude/skills/internal-comms/SKILL.md`"*

:::info Personalización
Este skill está pensado para ser adaptado a los formatos de tu empresa. Editá los archivos en `examples/` para que reflejen tus convenciones internas.
:::

## Nivel de aplicación

**Tipo:** Automático por inferencia | **Nivel:** Básico | **Formatos:** 3P, Newsletter, FAQ, General
