---
id: nestjs-skill
title: "Claude Skill: Patrones NestJS"
sidebar_label: "NestJS Skill"
---

# Claude Skill: Patrones NestJS

Skill que guía a Claude para crear módulos, controllers, services, guards, decorators y pipes siguiendo las convenciones de **NestJS**.

:::tip Descarga el skill
<a href="/flock-tech-guides/skills/nestjs/SKILL.md" download="SKILL.md">⬇ Descargar SKILL.md</a> — guardalo en `~/.claude/skills/nestjs/SKILL.md` para instalarlo directamente.
:::

## ¿Qué hace?

Cuando Claude crea o modifica código NestJS, este skill le indica:

- Templates de **módulos**, **controllers** y **services** con inyección de dependencias
- Patrones de **guards** para proteger endpoints
- Cómo crear **decorators** personalizados
- Cómo usar **pipes** para validación y transformación
- Comandos de **NestJS CLI** para scaffolding

## ¿Cuándo se activa?

Claude lo invoca automáticamente al detectar:

> *"Crear módulo NestJS"*, *"Crear controller"*, *"Crear service"*, *"Crear guard"*, *"Crear decorator"*, *"Crear pipe"*, *"Crear interceptor"*

## Artefactos cubiertos

| Artefacto | Descripción |
|---|---|
| **Module** | Agrupa controllers, services y providers |
| **Controller** | Define rutas HTTP y delega al service |
| **Service** | Contiene la lógica de negocio |
| **Guard** | Protege rutas con validaciones de acceso |
| **Decorator** | Extiende el comportamiento de clases y métodos |
| **Pipe** | Valida y transforma datos de entrada |
| **Interceptor** | Intercepta requests/responses para logging o transformación |

## Instalación rápida

1. Descargá el `SKILL.md` con el botón de arriba
2. Abrí Claude Code en tu terminal
3. Adjuntá el archivo y enviá:

> *"Instalá este skill en `~/.claude/skills/nestjs/SKILL.md`"*

## Nivel de aplicación

**Tipo:** Automático por inferencia | **Nivel:** Intermedio
