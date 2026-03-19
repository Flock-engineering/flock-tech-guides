---
id: project-setup-skill
title: "Claude Skill: Project Setup"
sidebar_label: "Project Setup Skill"
---

# Claude Skill: Project Setup

Skill que guía a Claude para **levantar proyectos de forma segura y ordenada** — leyendo el README, validando dependencias, entorno, variables y esquemas de base de datos antes de arrancar cualquier cosa.

:::tip Descarga el skill
<a href="/flock-tech-guides/skills/project-setup/SKILL.md" download="SKILL.md">⬇ Descargar SKILL.md</a> — guardalo en `~/.claude/skills/project-setup/SKILL.md` para instalarlo directamente.
:::

## ¿Qué hace?

Cuando le pedís a Claude que levante o configure un proyecto, este skill le indica que siga un protocolo de 8 fases:

1. **Reconocimiento** — Lee el README completo y entiende el stack antes de tocar nada
2. **Entorno** — Valida versiones de runtime (Node, Java, Python, .NET) contra lo requerido
3. **Dependencias** — Verifica que estén instaladas, detecta versiones desactualizadas y vulnerabilidades
4. **Variables de entorno** — Compara `.env.example` vs `.env`, reporta lo que falta sin exponer valores
5. **Base de datos** — Detecta migraciones pendientes (Prisma, Flyway, Django, Rails)
6. **Linting** — Verifica que el código no tenga errores antes de arrancar
7. **Tests** — Ejecuta el suite solo si el usuario lo confirma
8. **Arranque** — Solo si todo está 🟢 o 🟡, muestra el comando y espera confirmación

## ¿Cuándo se activa?

Claude lo invoca automáticamente al detectar:

> *"levantar proyecto"*, *"setup proyecto"*, *"configurar proyecto"*, *"arrancar proyecto"*, *"onboarding proyecto"*

## Reporte de estado

Cada validación se reporta con estado visual:

| Estado | Significado |
|---|---|
| 🟢 OK | Validación pasada, todo en orden |
| 🟡 Advertencia | Algo a revisar, no bloquea el arranque |
| 🔴 Error | Bloqueante — hay que resolverlo antes de continuar |

Al final, muestra un resumen unificado:

```
📋 Estado del Proyecto: mi-api

🟢 Entorno:       Node 20.x ✓
🟢 Dependencias:  Instaladas ✓
🟡 Librerías:     3 outdated (no críticas)
🔴 Variables:     DB_PASSWORD faltante en .env
🟢 BD:            Sin migraciones pendientes
🟢 Linting:       Sin errores

Próximo paso: Completá DB_PASSWORD en .env y volvé a validar.
```

## Reglas de seguridad

| Regla | Descripción |
|---|---|
| **README primero** | Lee y entiende el proyecto antes de ejecutar cualquier cosa |
| **Sin `.env` directo** | Nunca modifica `.env` — solo reporta variables faltantes |
| **Sin instalar sin mostrar** | Muestra qué se va a instalar antes de hacerlo |
| **Sin migrar sin confirmar** | Las migraciones de BD requieren confirmación explícita |
| **Sin exponer secrets** | Los valores de variables de entorno nunca se muestran |
| **Sin asumir** | Siempre valida desde cero, aunque "ya debería estar configurado" |

## Validación de variables de entorno

Compara claves (sin revelar valores):

```bash
# Reporta solo las claves, no los valores
🔴 Faltantes en .env: DB_PASSWORD, REDIS_URL, JWT_SECRET
🟡 En .env pero no en .env.example: DEBUG_MODE (¿falta documentar?)
🟢 Cubiertas: DATABASE_URL, PORT, NODE_ENV
```

## Compatibilidad multi-stack

Funciona con proyectos de cualquier stack:

| Stack | Qué valida |
|---|---|
| **Node.js** | `.nvmrc`, `npm outdated`, `npm audit`, `npm run lint` |
| **Java** | `pom.xml` / `build.gradle`, versiones Maven, Flyway |
| **Python** | `requirements.txt` / `pyproject.toml`, venv, pip outdated |
| **.NET** | `*.csproj` target framework, `dotnet format` |
| **Prisma** | `prisma migrate status`, `prisma validate` |
| **Docker** | `docker-compose --dry-run` si existe compose file |

## Actualización del README

Si el README está desactualizado o incompleto, propone cambios:

- Versiones de runtime incorrectas
- Pasos de instalación que ya no aplican
- Variables de entorno no documentadas
- Comandos útiles faltantes (seeds, migraciones, health check)

> Siempre muestra el diff antes de aplicar cualquier cambio al README.

## Instalación rápida

1. Descargá el `SKILL.md` con el botón de arriba
2. Guardalo en `~/.claude/skills/project-setup/SKILL.md`
3. Listo — Claude lo usa automáticamente cuando le pedís levantar un proyecto

## Nivel de aplicación

**Tipo:** Automático por inferencia | **Nivel:** Operacional
