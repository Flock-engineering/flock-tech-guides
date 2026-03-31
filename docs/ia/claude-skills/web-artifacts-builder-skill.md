---
id: web-artifacts-builder-skill
title: "Claude Skill: Web Artifacts Builder"
sidebar_label: "Web Artifacts Builder"
---

# Claude Skill: Web Artifacts Builder

Skill que guía a Claude para crear **artefactos HTML complejos y multi-componente para claude.ai**, usando React 18, TypeScript, Tailwind CSS y shadcn/ui con un pipeline de bundling que genera un único archivo HTML autocontenido.

:::tip Descarga el skill
<a href="/flock-tech-guides/skills/web-artifacts-builder/SKILL.md" download="SKILL.md">⬇ Descargar SKILL.md</a> — guardalo en `~/.claude/skills/web-artifacts-builder/SKILL.md` para instalarlo directamente.
:::

## ¿Qué hace?

Cuando Claude necesita construir un artefacto web complejo, este skill le indica:

- Inicializar un proyecto React con la estructura correcta usando `scripts/init-artifact.sh`
- Desarrollar el artefacto editando el código generado con componentes de shadcn/ui
- Bundlear todo el código en un único archivo HTML autocontenido con `scripts/bundle-artifact.sh`
- Evitar estéticas genéricas de IA: layouts centrados excesivos, gradientes púrpura, bordes uniformes e Inter font

## ¿Cuándo se activa?

Usar para artefactos complejos que requieren:

- **State management** con React hooks o librerías
- **Routing** entre múltiples vistas
- **Componentes shadcn/ui** (tablas, dialogs, forms, charts, etc.)
- **TypeScript** para tipado estricto

> Para artefactos simples de una sola página sin dependencias — no usar este skill, un JSX inline alcanza.

## Stack técnico

| Tecnología | Versión | Propósito |
|---|---|---|
| **React** | 18 | UI declarativa con hooks |
| **TypeScript** | latest | Tipado estricto |
| **Vite** | Auto-detectado | Dev server y build |
| **Parcel** | latest | Bundling a HTML único |
| **Tailwind CSS** | 3.4.1 | Estilos utilitarios |
| **shadcn/ui** | 40+ componentes | Componentes accesibles |
| **Radix UI** | incluido | Primitives sin estilos |

## Flujo de trabajo

### 1. Inicializar proyecto

```bash
bash scripts/init-artifact.sh <nombre-proyecto>
cd <nombre-proyecto>
```

Crea un proyecto completamente configurado con path aliases (`@/`), Tailwind con theming de shadcn/ui y Parcel listo para bundling.

### 2. Desarrollar el artefacto

Editar los archivos generados. Los 40+ componentes de shadcn/ui están pre-instalados y listos para importar.

### 3. Bundlear a HTML único

```bash
bash scripts/bundle-artifact.sh
```

Genera `bundle.html` — un archivo autocontenido con todo el JavaScript, CSS y dependencias inlineadas. Este archivo se puede compartir directamente en conversaciones de Claude.

### 4. Compartir con el usuario

El archivo `bundle.html` se muestra como artefacto en la conversación. Claude lo presenta y el usuario puede interactuar con él directamente.

### 5. Testing (opcional)

Solo si hay problemas o el usuario lo pide — usar Playwright o Puppeteer para verificar el artefacto después de mostrarlo.

## Directrices de diseño

**CRÍTICO**: Evitar "AI slop" — estéticas genéricas que hacen que todos los artefactos se vean iguales:

- **No usar**: layouts centrados excesivos, gradientes púrpura sobre blanco, bordes uniformes redondeados, Inter como única fuente
- **Sí usar**: jerarquía visual clara, paletas coherentes, tipografía con personalidad, layouts con asimetría intencional

## Lo que genera el script de init

```
<proyecto>/
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   └── components/
├── index.html
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

## Recursos

- **shadcn/ui components**: https://ui.shadcn.com/docs/components

## Instalación rápida

1. Descargá el `SKILL.md` con el botón de arriba
2. Abrí Claude Code en tu terminal
3. Adjuntá el archivo y enviá:

> *"Instalá este skill en `~/.claude/skills/web-artifacts-builder/SKILL.md`"*

## Nivel de aplicación

**Tipo:** Artefactos complejos multi-componente | **Stack:** React + TS + shadcn/ui | **Output:** HTML autocontenido
