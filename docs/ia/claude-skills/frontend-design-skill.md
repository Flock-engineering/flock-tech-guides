---
id: frontend-design-skill
title: "Claude Skill: Frontend Design"
sidebar_label: "Frontend Design"
---

# Claude Skill: Frontend Design

Skill que guía a Claude para crear **interfaces frontend distintivas y de calidad production**, evitando estéticas genéricas de IA ("AI slop"). Genera código real y funcional con atención excepcional al detalle visual y decisiones de diseño creativas.

:::tip Descarga el skill
<a href="/flock-tech-guides/skills/frontend-design/SKILL.md" download="SKILL.md">⬇ Descargar SKILL.md</a> — guardalo en `~/.claude/skills/frontend-design/SKILL.md` para instalarlo directamente.
:::

## ¿Qué hace?

Cuando Claude construye una interfaz web, este skill le indica:

- Analizar el contexto y la audiencia **antes de escribir una línea de código**
- Comprometerse con una dirección estética clara y ejecutarla con precisión
- Evitar los patrones visuales genéricos que hacen que todos los proyectos de IA se vean iguales
- Implementar tipografía, color, animaciones y composición espacial con intencionalidad

## ¿Cuándo se activa?

> *Construir componente web*, *crear landing page*, *diseñar dashboard*, *hacer UI para...*,
> *crear artefacto HTML*, *estilizar interfaz*, *diseñar página*

## Design Thinking — antes de codear

El skill obliga a pensar en cuatro dimensiones antes de escribir código:

| Dimensión | Pregunta |
|---|---|
| **Purpose** | ¿Qué problema resuelve esta interfaz? ¿Quién la usa? |
| **Tone** | ¿Cuál es la dirección estética? (minimalista brutal, maximalista, retro-futurista, etc.) |
| **Constraints** | Requerimientos técnicos (framework, performance, accesibilidad) |
| **Differentiation** | ¿Qué hace esto INOLVIDABLE? ¿Qué recordará alguien? |

## Directrices estéticas

### Tipografía
- Elegir fuentes **únicas e interesantes** — evitar Arial, Inter, Roboto, system fonts
- Combinar una display font distintiva con una body font refinada
- La tipografía comunica tanto como el contenido

### Color y tema
- Comprometerse con una estética coherente — usar CSS variables para consistencia
- Colores dominantes con acentos definidos > paletas tímidas y distribuidas uniformemente
- Variar entre temas claros y oscuros según el contexto

### Motion
- Animaciones de alta calidad en los **momentos correctos** — no micro-interacciones dispersas
- Una entrada de página bien orquestada con staggered reveals crea más deleite que 20 hovers aleatorios
- Preferir soluciones CSS-only para HTML; Motion library para React

### Composición espacial
- Layouts **inesperados**: asimetría, overlap, flujo diagonal, elementos que rompen la grilla
- Espacio negativo generoso O densidad controlada — no el término medio genérico

### Fondos y detalles visuales
- Crear atmósfera y profundidad — no defaults a solid colors
- Gradient meshes, noise textures, patrones geométricos, transparencias en capas, sombras dramáticas

## Lo que NUNCA hacer

Este skill existe para evitar el "AI slop":

- **Fuentes genéricas**: Inter, Roboto, Arial, system fonts como única elección
- **Esquemas de color clichés**: especialmente gradientes púrpura sobre blanco
- **Layouts predecibles**: hero centrado, cards uniformes, todo rounded-lg
- **Diseño sin contexto**: que podría ser cualquier cosa para cualquier usuario

## Outputs esperados

El código generado debe ser:
- **Production-grade y funcional** — no prototipos incompletos
- **Visualmente impactante y memorable** — algo que se recuerde
- **Cohesivo** — cada decisión conecta con la dirección estética elegida
- **Meticuloso en cada detalle** — los detalles son los que separan lo bueno de lo extraordinario

## Complejidad de implementación

La complejidad del código debe **coincidir con la visión estética**:

- **Diseños maximalistas**: código elaborado con animaciones extensas y efectos
- **Diseños minimalistas/refinados**: código con restraint, precisión y atención cuidadosa al espaciado

Elegancia es ejecutar bien la visión, no simplificar arbitrariamente.

## Instalación rápida

1. Descargá el `SKILL.md` con el botón de arriba
2. Abrí Claude Code en tu terminal
3. Adjuntá el archivo y enviá:

> *"Instalá este skill en `~/.claude/skills/frontend-design/SKILL.md`"*

## Nivel de aplicación

**Tipo:** Automático por inferencia | **Framework:** HTML/CSS/JS, React, Vue | **Output:** Código production-grade
