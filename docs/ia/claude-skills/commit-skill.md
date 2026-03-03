---
id: commit-skill
title: "Claude Skill: Convenciones de commits"
sidebar_label: "Commit Skill"
---

# Claude Skill: Convenciones de commits

Skill que guía a Claude para escribir mensajes de commit siguiendo el estándar **Conventional Commits**, con tipos, scopes y reglas definidas.

:::tip Descarga el skill
<a href="/flock-tech-guides/skills/commit/SKILL.md" download="SKILL.md">⬇ Descargar SKILL.md</a> — guardalo en `~/.claude/skills/commit/SKILL.md` para instalarlo directamente.
:::

## ¿Qué hace?

Cuando Claude hace un commit, este skill le indica:

- El formato correcto: `<type>(<scope>): <description>`
- Qué tipo usar según el cambio (`feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`)
- El scope correspondiente al módulo afectado (`auth`, `events`, `registrations`, `prisma`, etc.)
- Las reglas de estilo: primera letra minúscula, sin punto final, máximo 72 caracteres
- Cómo manejar fallos del pre-commit hook (Husky + lint-staged)

## ¿Cuándo se activa?

Claude lo invoca automáticamente al detectar intención de:

> *"Hacer commit"*, *"Escribir mensaje de commit"*, *"Preparar PR"*

## Tipos soportados

| Tipo | Uso |
|---|---|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `docs` | Documentación |
| `style` | Formato (no afecta lógica) |
| `refactor` | Refactorización |
| `test` | Agregar/modificar tests |
| `chore` | Tareas de mantenimiento |
| `perf` | Mejoras de performance |

## Scopes

Los scopes se definen por proyecto y mapean a los módulos o capas de la aplicación. Ejemplos comunes:

| Scope | Módulo típico |
|---|---|
| `auth` | Autenticación y usuarios |
| `api` | Endpoints generales |
| `db` | Base de datos / migraciones |
| `ui` | Capa de presentación |
| `config` | Configuración y variables de entorno |

> El SKILL.md incluye la tabla de scopes real del proyecto donde se instala.

## Instalación rápida

1. Descargá el `SKILL.md` con el botón de arriba
2. Abrí Claude Code en tu terminal
3. Adjuntá el archivo y enviá:

> *"Instalá este skill en `~/.claude/skills/commit/SKILL.md`"*

## Nivel de aplicación

**Tipo:** Automático por inferencia | **Nivel:** Básico
