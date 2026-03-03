---
id: jest-skill
title: "Claude Skill: Testing con Jest"
sidebar_label: "Jest Skill"
---

# Claude Skill: Testing con Jest

Skill que guía a Claude para escribir tests unitarios y E2E usando **Jest** y **Supertest**, con patrones de mocks, fixtures y estructura de archivos para proyectos NestJS.

:::tip Descarga el skill
<a href="/flock-tech-guides/skills/jest/SKILL.md" download="SKILL.md">⬇ Descargar SKILL.md</a> — guardalo en `~/.claude/skills/jest/SKILL.md` para instalarlo directamente.
:::

## ¿Qué hace?

Cuando Claude escribe tests, este skill le indica:

- Cómo estructurar tests unitarios y E2E (`describe` / `it` / `beforeEach`)
- Cómo mockear dependencias externas (base de datos, APIs, services de NestJS)
- Patrones de fixtures para datos de prueba
- Convenciones de nombres de archivos: `{feature}.spec.ts` y `{feature}.e2e-spec.ts`
- Comandos para correr tests en el proyecto

## ¿Cuándo se activa?

Claude lo invoca automáticamente al detectar:

> *"Escribir test unitario"*, *"Escribir test E2E"*, *"Crear mock"*, *"Agregar fixture"*, *"Testear service"*, *"Testear controller"*

## Tipos de tests cubiertos

| Tipo | Archivo | Descripción |
|---|---|---|
| **Unit** | `*.spec.ts` | Testea services y lógica de negocio con mocks |
| **E2E** | `*.e2e-spec.ts` | Testea endpoints HTTP con Supertest |

## Reglas clave

- Nunca testear contra base de datos real en tests unitarios
- Limpiar mocks entre tests con `beforeEach`
- No dejar tests dependientes entre sí
- Usar nombres descriptivos en cada `it`

## Instalación rápida

1. Descargá el `SKILL.md` con el botón de arriba
2. Abrí Claude Code en tu terminal
3. Adjuntá el archivo y enviá:

> *"Instalá este skill en `~/.claude/skills/jest/SKILL.md`"*

## Nivel de aplicación

**Tipo:** Automático por inferencia | **Nivel:** Intermedio
