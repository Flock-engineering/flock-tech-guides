---
name: commit
description: >
  Convenciones de commits para Nomadear.
  Trigger: hacer commit, escribir mensaje de commit, preparar cambios
license: MIT
metadata:
  author: nomadear
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

| Scope           | Módulo                   |
| --------------- | ------------------------ |
| `auth`          | Autenticación y usuarios |
| `events`        | Eventos y modificaciones |
| `registrations` | Preinscripciones         |
| `dealerships`   | Concesionarias           |
| `prisma`        | Base de datos            |
| `api`           | Endpoints generales      |

## Ejemplos

```bash
# Nueva funcionalidad
feat(events): agregar endpoint de historial de modificaciones

# Bug fix
fix(auth): corregir validación de dealershipId para ASESOR

# Refactor
refactor(registrations): extraer lógica de validación a método privado

# Tests
test(events): agregar tests E2E para reschedule

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
