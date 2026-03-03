---
id: swagger-skill
title: "Claude Skill: Documentación Swagger"
sidebar_label: "Swagger Skill"
---

# Claude Skill: Documentación Swagger

Skill que guía a Claude para documentar endpoints con **Swagger / OpenAPI** usando decorators de NestJS, incluyendo ejemplos, autenticación y tipos de respuesta.

:::tip Descarga el skill
<a href="/flock-tech-guides/skills/swagger/SKILL.md" download="SKILL.md">⬇ Descargar SKILL.md</a> — guardalo en `~/.claude/skills/swagger/SKILL.md` para instalarlo directamente.
:::

## ¿Qué hace?

Cuando Claude documenta un endpoint, este skill le indica:

- Qué decorators aplicar en **controllers**: `@ApiTags`, `@ApiOperation`, `@ApiResponse`, `@ApiBearerAuth`
- Cómo documentar **DTOs** con `@ApiProperty` y sus opciones
- Cómo definir **tipos de respuesta** con ejemplos de JSON
- Cómo documentar **query parameters** y **file uploads**
- La configuración global de Swagger en `main.ts` del proyecto

## ¿Cuándo se activa?

Claude lo invoca automáticamente al detectar:

> *"Documentar endpoint"*, *"Agregar ejemplos Swagger"*, *"Configurar Swagger"*, *"Agregar API tags"*

## Decorators principales

| Decorator | Dónde | Descripción |
|---|---|---|
| `@ApiTags('nombre')` | Controller | Agrupa endpoints en la UI |
| `@ApiOperation({ summary })` | Método | Describe qué hace el endpoint |
| `@ApiResponse({ status, type })` | Método | Define respuesta esperada |
| `@ApiBearerAuth()` | Método/Controller | Marca que requiere JWT |
| `@ApiProperty()` | DTO | Documenta un campo del DTO |
| `@ApiQuery()` | Método | Documenta query params |

## Instalación rápida

1. Descargá el `SKILL.md` con el botón de arriba
2. Abrí Claude Code en tu terminal
3. Adjuntá el archivo y enviá:

> *"Instalá este skill en `~/.claude/skills/swagger/SKILL.md`"*

## Nivel de aplicación

**Tipo:** Automático por inferencia | **Nivel:** Básico
