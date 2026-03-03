---
id: skill-creator-skill
title: "Claude Skill: Creador de Skills"
sidebar_label: "Skill Creator"
---

# Claude Skill: Creador de Skills

Meta-skill que guía a Claude para **crear nuevos skills** en cualquier proyecto, siguiendo la estructura, convenciones de nombres y el proceso de sincronización de Claude Code.

:::tip Descarga el skill
<a href="/flock-tech-guides/skills/skill-creator/SKILL.md" download="SKILL.md">⬇ Descargar SKILL.md</a> — guardalo en `~/.claude/skills/skill-creator/SKILL.md` para instalarlo directamente.
:::

## ¿Qué hace?

Cuando Claude crea un nuevo skill, este skill le indica:

- La **estructura obligatoria** de un `SKILL.md` (frontmatter + contenido)
- Campos requeridos: `name`, `description`, `allowed-tools`, `metadata`
- Convenciones de nombres: kebab-case, descriptivo y accionable
- Cómo usar `skill-sync.sh` para sincronizar el skill con el proyecto
- Tabla de **scopes** disponibles y cuándo usar cada uno
- Checklist de validación antes de publicar el skill

## ¿Cuándo se activa?

Claude lo invoca automáticamente al detectar:

> *"Crear nueva skill"*, *"Agregar skill al proyecto"*

## Estructura de un SKILL.md

```yaml
---
name: nombre-del-skill
description: >
  Descripción breve de qué hace.
  Trigger: cuándo activarlo automáticamente
license: MIT
metadata:
  author: tu-proyecto
  version: '1.0'
  scope: [root]
  auto_invoke:
    - 'Frase que lo activa'
allowed-tools: Read, Write, Bash
---

# Nombre del Skill

## Paso 1: ...
## Paso 2: ...
```

## Scopes disponibles

Los scopes definen en qué contexto del proyecto se activa el skill:

| Scope | Descripción |
|---|---|
| `root` | Disponible en todo el proyecto |
| `[módulo]` | Solo se activa dentro de ese módulo o carpeta |

> Definí los scopes según la estructura de tu proyecto.

## Instalación rápida

1. Descargá el `SKILL.md` con el botón de arriba
2. Abrí Claude Code en tu terminal
3. Adjuntá el archivo y enviá:

> *"Instalá este skill en `~/.claude/skills/skill-creator/SKILL.md`"*

## Nivel de aplicación

**Tipo:** Manual | **Nivel:** Avanzado
