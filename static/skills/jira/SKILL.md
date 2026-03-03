---
name: jira
description: >
  Generar tarjetas de Jira a partir de commits y features.
  Trigger: crear tarjeta jira, generar tickets, documentar feature para jira
license: MIT
metadata:
  author: nomadear
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
Proyecto: NOMADEAR
Tipo: Epic
Título: [Módulo] Nombre descriptivo de la feature

Descripción:
## Resumen
Breve descripción de la funcionalidad.

## Alcance
- Qué incluye
- Qué NO incluye

## Stories relacionadas
- NOMADEAR-XXX: Story 1
- NOMADEAR-XXX: Story 2

Labels: backend, [módulo]
```

### Story (Feature individual)

```
Proyecto: NOMADEAR
Tipo: Story
Título: [Módulo] Acción específica
Epic Link: NOMADEAR-XXX (si aplica)

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
Proyecto: NOMADEAR
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
Proyecto: NOMADEAR
Tipo: Sub-task
Título: [Acción] Descripción corta
Parent: NOMADEAR-XXX

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
b84f9f5 feat(events): implementar sistema completo de modificaciones
460068d refactor(dealerships): eliminar endpoint duplicado
26246c8 feat(dealerships): agregar módulo de concesionarias
```

### Output: Tarjetas Jira

**Epic:**

```
Tipo: Epic
Título: [Backend] Sistema de eventos y concesionarias
Descripción:
## Resumen
Implementación del sistema de gestión de eventos con modificaciones,
estados y módulo de concesionarias.

## Stories
- Sistema de modificaciones de eventos
- Módulo de concesionarias
- Arquitectura de agentes

Labels: backend, events, dealerships
```

**Story 1:**

```
Tipo: Story
Título: [Events] Sistema de modificaciones y estados
Epic: [Backend] Sistema de eventos y concesionarias

Descripción:
## Contexto
Los eventos necesitan un historial de cambios y estados controlados.

## Implementación
- Estados: ACTIVE, SUSPENDED, CANCELLED
- Acciones: EDITED, RESCHEDULED, SUSPENDED, RESTORED, CANCELLED
- Tabla EventModification para auditoría
- Endpoints: /reschedule, /suspend, /restore, /history

## Archivos
- src/events/events.service.ts
- src/events/events.controller.ts
- prisma/schema.prisma

## Criterios de Aceptación
- [ ] Suspender evento requiere justificación
- [ ] Historial muestra quién hizo cada cambio
- [ ] No se pueden inscribir a eventos suspendidos

Labels: backend, events
Story Points: 5
```

**Story 2:**

```
Tipo: Story
Título: [Dealerships] Módulo de concesionarias
Epic: [Backend] Sistema de eventos y concesionarias

Descripción:
## Contexto
Se necesita gestionar las concesionarias para multi-tenancy.

## Implementación
- Modelo Dealership con nombre, provincia, ciudad, trademark
- Endpoint público GET /dealerships
- Relación con Users y Events

## Criterios de Aceptación
- [ ] Listar concesionarias sin autenticación
- [ ] Unique constraint nombre + provincia

Labels: backend, dealerships
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
| `events`        | Módulo de eventos           |
| `registrations` | Preinscripciones            |
| `dealerships`   | Concesionarias              |
| `bug`           | Corrección de error         |
| `tech-debt`     | Deuda técnica               |
| `documentation` | Documentación               |
