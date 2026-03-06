---
id: commit-skill
title: "Claude Skill: Convenciones de commits"
sidebar_label: "Commit Skill"
---

# Claude Skill: Convenciones de commits

Skill que guía a Claude para escribir mensajes de commit siguiendo el estándar **Conventional Commits**, con flujo de PR obligatorio, commits atómicos y reglas de seguridad sobre qué commitear.

:::tip Descarga el skill
<a href="/flock-tech-guides/skills/commit/SKILL.md" download="SKILL.md">⬇ Descargar SKILL.md</a> — guardalo en `~/.claude/skills/commit/SKILL.md` para instalarlo directamente.
:::

## ¿Qué hace?

Cuando Claude hace o prepara un commit, este skill le indica:

- El formato correcto: `<type>(<scope>): <description>`
- Qué tipo usar según el cambio (`feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`, `ci`, `build`)
- Cómo documentar **breaking changes** con `!` o el footer `BREAKING CHANGE:`
- El scope correspondiente al módulo afectado — inferido desde `git diff --name-only`
- Las reglas de estilo: primera letra minúscula, sin punto final, máximo 72 caracteres
- Que el body debe explicar el **por qué**, no solo el qué
- Que los commits deben ser **atómicos** — un propósito lógico por commit
- El **flujo de PR obligatorio** — nunca pushear directo a `main` o `master`
- Cómo agregar archivos de forma **selectiva** — nunca `git add .` a ciegas
- Cómo manejar fallos del pre-commit hook

## ¿Cuándo se activa?

Claude lo invoca automáticamente al detectar intención de:

> *"Hacer commit"*, *"Escribir mensaje de commit"*, *"Preparar PR"*, *"Pushear cambios"*

## Tipos soportados

| Tipo | Uso |
|---|---|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `docs` | Documentación |
| `style` | Formato (no afecta lógica) |
| `refactor` | Refactorización sin cambio de comportamiento |
| `test` | Agregar o modificar tests |
| `chore` | Tareas de mantenimiento (deps, config, scripts) |
| `perf` | Mejoras de performance |
| `ci` | Cambios en pipelines de CI/CD |
| `build` | Cambios en el sistema de build o dependencias |

## Flujo de trabajo

El skill impone un flujo de PR explícito:

1. Trabajar en una **rama feature** — nunca directamente en `main` o `master`
2. Revisar con `git status` + `git diff` antes de stagear
3. Agregar archivos **selectivamente** — `git add <archivo>`, no `git add .`
4. Commit con mensaje descriptivo siguiendo Conventional Commits
5. Push a la rama remota
6. **Crear PR** con descripción, asignar revisor y esperar aprobación

## Reglas de seguridad

| Regla | Descripción |
|---|---|
| **Sin `git add .`** | Puede incluir `.env`, binarios o archivos generados sin querer |
| **Sin push directo a `main`** | Aunque tengas permisos — siempre por PR |
| **Sin secrets** | `.env`, tokens, credenciales nunca en el repo |
| **Sin `--no-verify`** | No saltear hooks — existen para proteger la calidad |
| **Sin `--force` en ramas compartidas** | Coordinar con el equipo antes |

## Instalación rápida

1. Descargá el `SKILL.md` con el botón de arriba
2. Abrí Claude Code en tu terminal
3. Adjuntá el archivo y enviá:

> *"Instalá este skill en `~/.claude/skills/commit/SKILL.md`"*

## Nivel de aplicación

**Tipo:** Automático por inferencia | **Nivel:** Básico
