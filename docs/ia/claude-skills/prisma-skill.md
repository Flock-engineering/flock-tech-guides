---
id: prisma-skill
title: "Claude Skill: Prisma ORM"
sidebar_label: "Prisma Skill"
---

# Claude Skill: Prisma ORM

Skill que guía a Claude para trabajar con **Prisma** y **PostgreSQL**: schema, migraciones, queries, relaciones y transacciones.

:::tip Descarga el skill
<a href="/flock-tech-guides/skills/prisma/SKILL.md" download="SKILL.md">⬇ Descargar SKILL.md</a> — guardalo en `~/.claude/skills/prisma/SKILL.md` para instalarlo directamente.
:::

## ¿Qué hace?

Cuando Claude modifica la base de datos, este skill le indica:

- Patrones de **modelos** en `schema.prisma` con campos opcionales y relaciones
- Tipos de relaciones: **1-a-muchos**, **muchos-a-muchos** e **intermedias explícitas**
- Queries tipadas: `findUnique`, `findMany` con filtros, `create` con relaciones, `update`, **soft delete**
- Cómo usar **transacciones** para operaciones atómicas
- Comandos de migración y seed del proyecto

## ¿Cuándo se activa?

Claude lo invoca automáticamente al detectar:

> *"Modificar schema.prisma"*, *"Crear migración"*, *"Escribir query Prisma"*, *"Crear seeder"*, *"Agregar modelo"*, *"Agregar relación"*

## Comandos principales

```bash
# Crear y aplicar migración
npx prisma migrate dev --name nombre-migracion

# Generar cliente Prisma
npx prisma generate

# Abrir Prisma Studio
npx prisma studio

# Correr seeders
npx ts-node prisma/seed.ts
```

## Patrones de queries

| Operación | Método Prisma |
|---|---|
| Buscar por ID | `findUnique` |
| Listar con filtros | `findMany` |
| Crear con relaciones | `create` con `connect` |
| Actualizar | `update` |
| Soft delete | `update` con `deletedAt` |
| Atómico | `$transaction` |

## Instalación rápida

1. Descargá el `SKILL.md` con el botón de arriba
2. Abrí Claude Code en tu terminal
3. Adjuntá el archivo y enviá:

> *"Instalá este skill en `~/.claude/skills/prisma/SKILL.md`"*

## Nivel de aplicación

**Tipo:** Automático por inferencia | **Nivel:** Intermedio
