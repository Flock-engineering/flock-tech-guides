---
id: commit-skill-raw
title: "SKILL.md — Commit"
sidebar_label: "SKILL.md"
---

# SKILL.md — Commit

Archivo de instrucciones que Claude usa internamente. Si encontrás algo para mejorar, abrí un PR directamente.

:::info Contribuir
[✏️ Sugerir corrección en GitHub](https://github.com/Flock-engineering/flock-tech-guides/edit/dev/static/skills/commit/SKILL.md) — GitHub te propone hacer fork y PR automáticamente si no tenés permisos de push.
:::

[⬇ Descargar SKILL.md](/flock-tech-guides/skills/commit/SKILL.md)

---

````md
---
name: commit
description: >
  Convenciones de commits con Conventional Commits.
  Trigger: hacer commit, escribir mensaje de commit, preparar cambios
license: MIT
metadata:
  author: tu-proyecto
  version: '1.0'
  scope: [root]
  auto_invoke:
    - 'Hacer commit'
    - 'Escribir mensaje de commit'
    - 'Preparar PR'
allowed-tools: Bash
---

# Commit Skill

## Formato de Commit

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

## Types

| Type       | Uso                        |
| ---------- | -------------------------- |
| `feat`     | Nueva funcionalidad        |
| `fix`      | Corrección de bug          |
| `docs`     | Documentación              |
| `style`    | Formato (no afecta lógica) |
| `refactor` | Refactorización            |
| `test`     | Agregar/modificar tests    |
| `chore`    | Tareas de mantenimiento    |
| `perf`     | Mejoras de performance     |

## Scopes

Definí los scopes según los módulos de tu proyecto. Ejemplos comunes:

| Scope      | Módulo                   |
| ---------- | ------------------------ |
| `auth`     | Autenticación y usuarios |
| `api`      | Endpoints generales      |
| `prisma`   | Base de datos            |
| `core`     | Lógica central           |
| `ui`       | Interfaz de usuario      |

> Adaptá esta tabla a los módulos de tu proyecto.

## Ejemplos

```bash
# Nueva funcionalidad
feat(auth): agregar endpoint de login con JWT

# Bug fix
fix(api): corregir validación de parámetros en query

# Refactor
refactor(core): extraer lógica de validación a método privado

# Tests
test(auth): agregar tests E2E para refresh token

# Docs
docs: actualizar README con nuevos endpoints

# Chore
chore: actualizar dependencias de NestJS
```

## Reglas

### ALWAYS

- Usar inglés o español consistente (el proyecto usa español)
- Primera letra minúscula en description
- No usar punto final en description
- Limitar primera línea a 72 caracteres
- Usar body para explicar "qué" y "por qué"

### NEVER

- Commits sin mensaje descriptivo
- Mezclar múltiples cambios no relacionados
- Commitear archivos `.env` o secrets
- Commitear código sin formatear (Husky lo previene)

## Comandos

```bash
# Ver cambios
git status
git diff

# Agregar archivos
git add .
git add src/events/

# Commit
git commit -m "feat(events): agregar suspensión de eventos"

# Commit con body
git commit -m "feat(events): agregar suspensión de eventos

- Nuevo endpoint PATCH /events/:id/suspend
- Registra EventModification con justificación
- Actualiza status a SUSPENDED"

# Push
git push origin feature/nombre-feature
```

## Pre-commit Hook

El proyecto usa Husky + lint-staged:

```bash
# Se ejecuta automáticamente antes de cada commit:
# 1. Prettier formatea archivos .ts
# 2. ESLint verifica errores
# 3. Si hay errores, el commit falla
```

Si el commit falla por linting:

```bash
# Corregir manualmente o:
npm run lint -- --fix
npm run format

# Luego reintentar commit
git commit -m "..."
```
````
