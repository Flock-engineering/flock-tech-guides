---
id: docusaurus-skill
title: "Claude Skill: Docusaurus"
sidebar_label: "Docusaurus Skill"
---

# Claude Skill: Docusaurus

Skill que guía a Claude para construir sitios Docusaurus con foco en **diseño, usabilidad y buenas prácticas** — cubriendo desde design tokens y dark mode hasta sidebars, landing pages y componentes custom.

:::tip Descarga el skill
<a href="/flock-tech-guides/skills/docusaurus/SKILL.md" download="SKILL.md">⬇ Descargar SKILL.md</a> — guardalo en `~/.claude/skills/docusaurus/SKILL.md` para instalarlo directamente.
:::

## ¿Qué hace?

Cuando Claude trabaja con un sitio Docusaurus, este skill le indica:

- **Design system completo** con CSS custom properties, paleta de colores y tipografía con jerarquía
- **Dark mode** obligatorio con tokens para `:root` y `[data-theme='dark']`
- **Estructura de proyecto** estándar: `docs/`, `src/pages/`, `src/components/`, `src/css/`
- **Configuración** de `docusaurus.config.js`: presets, navbar, footer, Algolia, Mermaid, i18n
- **Sidebars** con categorías anidadas, generated indexes y organización lógica
- **Componentes custom** con CSS Modules, patrón de Cards y swizzling
- **Contenido MDX**: frontmatter, admonitions, tabs, code blocks con highlight, diagramas Mermaid
- **Landing pages** con Hero Section y HomepageFeatures
- **UX patterns**: navegación, búsqueda, responsive design, breadcrumbs

## ¿Cuándo se activa?

Claude lo invoca automáticamente al detectar:

> *"Crear página Docusaurus"*, *"Agregar documentación"*, *"Configurar Docusaurus"*, *"Mejorar diseño Docusaurus"*, *"Crear componente Docusaurus"*, *"Personalizar tema Docusaurus"*, *"Agregar sidebar"*, *"Crear landing page"*

## Reglas clave

| Regla | Descripción |
|---|---|
| **CSS custom properties** | Todo color, fuente y espaciado va en variables CSS |
| **Dark mode obligatorio** | Cada estilo custom tiene contraparte `[data-theme='dark']` |
| **CSS Modules** | Componentes custom usan `styles.module.css`, nunca CSS global |
| **Frontmatter completo** | `id`, `title`, `sidebar_label` como mínimo en cada doc |
| **Sin colores hardcodeados** | Siempre `var(--nombre-variable)` |
| **Sin estilos inline** | Usar CSS Modules o clases de Infima |
| **Responsive** | Todo componente debe funcionar en mobile |
| **Build antes de deploy** | Siempre `npm run build` para verificar |

## Instalación rápida

1. Descargá el `SKILL.md` con el botón de arriba
2. Abrí Claude Code en tu terminal
3. Adjuntá el archivo y enviá:

> *"Instalá este skill en `~/.claude/skills/docusaurus/SKILL.md`"*

## Nivel de aplicación

**Tipo:** Automático por inferencia | **Nivel:** Intermedio
