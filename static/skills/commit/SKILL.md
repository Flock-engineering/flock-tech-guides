---
name: commit
description: >
  Convenciones de commits con Conventional Commits, flujo de PR y permisos de push.
  Trigger: hacer commit, escribir mensaje de commit, preparar cambios, preparar PR
license: MIT
metadata:
  author: tu-proyecto
  version: '1.1'
  scope: [root]
  auto_invoke:
    - 'Hacer commit'
    - 'Escribir mensaje de commit'
    - 'Preparar PR'
    - 'Pushear cambios'
allowed-tools: Read, Glob, Grep, Bash
---

# Commit Skill

## Formato de Commit

```
<type>(<scope>): <description>

[optional body — explicar el POR QUÉ del cambio]

[optional footer — breaking changes, refs a issues/PRs]
```

## Types

| Type       | Uso                                              |
| ---------- | ------------------------------------------------ |
| `feat`     | Nueva funcionalidad                              |
| `fix`      | Corrección de bug                                |
| `docs`     | Documentación                                    |
| `style`    | Formato (no afecta lógica)                       |
| `refactor` | Refactorización sin cambio de comportamiento     |
| `test`     | Agregar o modificar tests                        |
| `chore`    | Tareas de mantenimiento (deps, config, scripts)  |
| `perf`     | Mejoras de performance                           |
| `ci`       | Cambios en pipelines de CI/CD                    |
| `build`    | Cambios en el sistema de build o dependencias    |

## Breaking Changes

Para cambios que rompen compatibilidad, usar `!` en el type o footer:

```bash
# Con ! en el type
feat!: cambiar formato de respuesta de la API de usuarios

# Con footer BREAKING CHANGE
feat(api): cambiar autenticación a OAuth2

BREAKING CHANGE: el endpoint /auth/login ahora requiere client_id y client_secret.
Actualizar todos los consumers antes de deployar.
```

## Scopes

Inferí el scope del módulo o directorio principal afectado. Adaptá esta tabla a tu proyecto:

| Scope      | Módulo                             |
| ---------- | ---------------------------------- |
| `auth`     | Autenticación y usuarios           |
| `api`      | Endpoints generales                |
| `core`     | Lógica central / dominio           |
| `ui`       | Interfaz de usuario                |
| `db`       | Base de datos / migraciones        |
| `config`   | Configuración de la aplicación     |
| `infra`    | Infraestructura / deploy           |

> Inspeccioná los módulos del proyecto con `git diff --name-only` para inferir el scope correcto.

## Reglas

### ALWAYS

- Commits **atómicos**: un commit = un propósito lógico (no mezclar múltiples features)
- Primera letra **minúscula** en description, **sin punto final**
- Limitar primera línea a **72 caracteres**
- Usar body para explicar el **por qué** del cambio, no solo el qué
- Lenguaje consistente — si el proyecto usa español, todo en español
- Agregar archivos de forma **selectiva**: `git add <archivo>` o `git add <directorio/>`
- Hacer `git status` antes de agregar para verificar qué se va a commitear
- **Crear PR** hacia la rama protegida — nunca pushear directo a `main` o `master`
- Solicitar **revisión de al menos un compañero** antes de mergear
- Al crear un PR, **mostrar siempre un resumen** con: link al PR, rama origen → destino, y qué cambió

### NEVER

- Commits sin mensaje descriptivo (`fix`, `cambios`, `wip` sin contexto)
- Mezclar múltiples cambios no relacionados en un solo commit
- Usar `git add .` sin revisar qué archivos se incluyen — puede commitear `.env`, binarios o archivos generados
- Commitear archivos `.env`, secrets, credenciales o tokens
- Commitear código sin formatear si el proyecto tiene linter/formatter
- **Pushear directo a `main` o `master`** sin PR — aunque tengas permisos de push
- Mergear sin aprobación si el proyecto tiene branch protection rules
- Hacer `git commit --amend` o `git push --force` en ramas compartidas sin coordinación del equipo

## Flujo de trabajo con PR

```bash
# 1. Trabajar en una rama feature
git checkout -b feat/nombre-feature    # desde main/dev

# 2. Revisar qué cambió antes de stagear
git status
git diff

# 3. Agregar archivos selectivamente
git add src/events/event.service.ts
git add src/events/event.controller.ts
# NO: git add .

# 4. Commit con mensaje descriptivo
git commit -m "feat(events): agregar suspensión de eventos"

# 5. Push a la rama remota
git push <remote> feat/nombre-feature

# 6. Crear PR hacia la rama protegida (main o dev)
# - Asignar revisor
# - Completar descripción: qué cambió y por qué
# - Esperar aprobación antes de mergear

# 7. Mostrar resumen del PR al usuario:
# ✅ PR creado: https://github.com/org/repo/pull/123
# feat/nombre-feature → main
# Qué cambió: [resumen en 1-2 líneas]
```

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
chore: actualizar dependencias de NestJS a v10

# CI
ci: agregar step de cobertura de código en pipeline

# Build
build: migrar bundler de webpack a vite
```

### Commit con body (explicar el por qué)

```bash
git commit -m "feat(events): agregar suspensión de eventos

Se necesitaba un mecanismo para pausar eventos sin eliminarlos,
dado que los organizadores solicitaban poder reactivarlos luego
sin perder la información asociada.

- Nuevo endpoint PATCH /events/:id/suspend
- Registra EventModification con justificación obligatoria
- Actualiza status a SUSPENDED sin borrar inscripciones"
```

## Pre-commit Hook

Si el proyecto tiene hooks (Husky, Lefthook, git hooks nativos):

```bash
# Antes del commit se ejecuta automáticamente:
# 1. Formatter (Prettier, dotnet format, etc.)
# 2. Linter (ESLint, Checkstyle, etc.)
# 3. Si hay errores, el commit falla — corregir y reintentar
```

Si el commit falla por linting:

```bash
# Corregir los errores reportados y reintentar:
git commit -m "..."   # no usar --no-verify para saltear los hooks
```

> **Nunca usar `--no-verify`** para saltear hooks — los hooks existen para proteger la calidad del código.

## Comandos útiles

```bash
# Ver estado y cambios antes de commitear
git status
git diff
git diff --name-only      # solo nombres de archivos cambiados

# Ver historial reciente
git log --oneline -10

# Agregar selectivamente (interactivo)
git add -p <archivo>      # elegir hunks específicos dentro de un archivo

# Deshacer el último commit (sin perder cambios)
git reset --soft HEAD~1

# Ver ramas remotas
git branch -r
```
