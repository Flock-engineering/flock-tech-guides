---
name: jira
description: >
  Generar tarjetas de Jira a partir de commits y features.
  Trigger: crear tarjeta jira, generar tickets, documentar feature para jira
license: MIT
metadata:
  author: tu-proyecto
  version: '1.0'
  scope: [root]
  auto_invoke:
    - 'Crear tarjeta Jira'
    - 'Generar tickets'
    - 'Documentar feature para Jira'
    - 'Preparar release notes'
allowed-tools: Bash, Read, Write
---

# Jira Skill

Genera estructuras de tarjetas Jira a partir de commits de git.

## Critical Rules

### ALWAYS

- Leer commits con `git log` antes de generar tarjetas
- Agrupar commits relacionados en una sola Epic/Story
- Mapear tipo de commit a tipo de tarjeta Jira
- Incluir criterios de aceptación basados en el código

### NEVER

- Crear una tarjeta por cada commit (agrupar por feature)
- Omitir el módulo/scope en las tarjetas
- Dejar descripción vacía

---

## Mapeo Commit → Jira

| Commit Type | Jira Type   | Prioridad |
| ----------- | ----------- | --------- |
| `feat`      | Story       | Medium    |
| `fix`       | Bug         | High      |
| `refactor`  | Task        | Low       |
| `perf`      | Improvement | Medium    |
| `docs`      | Task        | Low       |
| `test`      | Sub-task    | Low       |

---

## Estructura de Tarjeta

### Epic (Feature grande)

```
Proyecto: TU-PROYECTO
Tipo: Epic
Título: [Módulo] Nombre descriptivo de la feature

Descripción:
## Resumen
Breve descripción de la funcionalidad.

## Alcance
- Qué incluye
- Qué NO incluye

## Stories relacionadas
- TU-PROYECTO-XXX: Story 1
- TU-PROYECTO-XXX: Story 2

Labels: backend, [módulo]
```

### Story (Feature individual)

```
Proyecto: TU-PROYECTO
Tipo: Story
Título: [Módulo] Acción específica
Epic Link: TU-PROYECTO-XXX (si aplica)

Descripción:
## Contexto
Por qué se necesita esta funcionalidad.

## Implementación
Resumen técnico de lo que se hizo.

## Archivos modificados
- src/module/file.ts
- src/module/other.ts

## Criterios de Aceptación
- [ ] Criterio 1
- [ ] Criterio 2
- [ ] Tests pasan

Labels: backend, [módulo]
Story Points: X
```

### Bug

```
Proyecto: TU-PROYECTO
Tipo: Bug
Título: [Módulo] Descripción del bug corregido
Prioridad: High

Descripción:
## Problema
Qué estaba fallando.

## Causa
Por qué fallaba.

## Solución
Cómo se corrigió.

## Cómo verificar
Pasos para confirmar que está arreglado.

Labels: backend, bug, [módulo]
```

### Sub-task

```
Proyecto: TU-PROYECTO
Tipo: Sub-task
Título: [Acción] Descripción corta
Parent: TU-PROYECTO-XXX

Descripción:
Detalle de la subtarea.
```

---

## Comando para Obtener Commits

```bash
# Commits desde última release/tag
git log --oneline $(git describe --tags --abbrev=0)..HEAD

# Commits de una rama específica
git log --oneline main..feature/branch-name

# Commits con detalle
git log --pretty=format:"%h - %s%n%b" main..HEAD

# Commits agrupados por tipo
git log --oneline | grep "^.*feat"
git log --oneline | grep "^.*fix"
```

---

## Ejemplo Completo

### Input: Commits de una feature

```
8deed6a feat(docs): implementar arquitectura de agentes con skills
b84f9f5 feat(users): implementar sistema completo de perfil de usuario
460068d refactor(api): eliminar endpoint duplicado de búsqueda
26246c8 feat(auth): agregar módulo de autenticación JWT
```

### Output: Tarjetas Jira

**Epic:**

```
Tipo: Epic
Título: [Backend] Autenticación y perfiles de usuario
Descripción:
## Resumen
Implementación del sistema de autenticación JWT y gestión
de perfiles de usuario con roles y permisos.

## Stories
- Sistema de autenticación JWT
- Módulo de perfiles de usuario
- Arquitectura de agentes

Labels: backend, auth, users
```

**Story 1:**

```
Tipo: Story
Título: [Auth] Sistema de autenticación JWT
Epic: [Backend] Autenticación y perfiles de usuario

Descripción:
## Contexto
El sistema necesita autenticación segura con roles diferenciados.

## Implementación
- Login con email/password y JWT
- Roles: ADMIN, USER
- Guards: JwtAuthGuard, RolesGuard
- Endpoints: /auth/login, /auth/refresh

## Archivos
- src/auth/auth.service.ts
- src/auth/auth.controller.ts
- src/auth/jwt.strategy.ts

## Criterios de Aceptación
- [ ] Login retorna access_token válido
- [ ] Token expira correctamente
- [ ] Endpoints protegidos rechazan requests sin token

Labels: backend, auth
Story Points: 5
```

**Story 2:**

```
Tipo: Story
Título: [Users] Módulo de perfiles de usuario
Epic: [Backend] Autenticación y perfiles de usuario

Descripción:
## Contexto
Se necesita gestionar los perfiles de usuario con roles.

## Implementación
- Modelo User con nombre, email, rol
- Endpoint GET /users/me para perfil propio
- Relación con roles y permisos

## Criterios de Aceptación
- [ ] Usuario puede ver su propio perfil
- [ ] Admin puede listar todos los usuarios
- [ ] Email único por usuario

Labels: backend, users
Story Points: 3
```

---

## Workflow

1. **Obtener commits**: `git log --oneline main..HEAD`
2. **Agrupar por feature**: Identificar commits relacionados
3. **Determinar tipo**: Epic si son múltiples stories, Story si es individual
4. **Generar estructura**: Usar templates de arriba
5. **Agregar detalles**: Leer código para criterios de aceptación

---

## Labels Estándar

| Label           | Uso                         |
| --------------- | --------------------------- |
| `backend`       | Cambios en el backend       |
| `frontend`      | Cambios en el frontend      |
| `auth`          | Relacionado a autenticación |
| `feature`       | Nueva funcionalidad         |
| `bug`           | Corrección de error         |
| `tech-debt`     | Deuda técnica               |
| `documentation` | Documentación               |
