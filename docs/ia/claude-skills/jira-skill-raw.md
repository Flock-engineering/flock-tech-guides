---
id: jira-skill-raw
title: "SKILL.md — Jira"
sidebar_label: "SKILL.md"
---

# SKILL.md — Jira

Archivo de instrucciones que Claude usa internamente. Si encontrás algo para mejorar, abrí un PR directamente.

:::info Contribuir
[✏️ Sugerir corrección en GitHub](https://github.com/Flock-engineering/flock-tech-guides/edit/dev/static/skills/jira/SKILL.md) — GitHub te propone hacer fork y PR automáticamente si no tenés permisos de push.
:::

[⬇ Descargar SKILL.md](pathname:///flock-tech-guides/skills/jira/SKILL.md)

---

````md
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
````
