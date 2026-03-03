---
id: nomadear-auth-skill
title: "Claude Skill: Autenticación Nomadear"
sidebar_label: "Nomadear Auth Skill"
---

# Claude Skill: Autenticación Nomadear

Skill que guía a Claude para trabajar con el sistema de autenticación JWT con roles de Nomadear: login, registro, guards, permisos por rol y scoping por concesionaria.

:::tip Descarga el skill
<a href="/flock-tech-guides/skills/nomadear-auth/SKILL.md" download="SKILL.md">⬇ Descargar SKILL.md</a> — guardalo en `~/.claude/skills/nomadear-auth/SKILL.md` para instalarlo directamente.
:::

## ¿Qué hace?

Cuando Claude trabaja con auth, este skill le indica:

- Los **roles** del sistema y sus permisos (`ADMIN`, `ASESOR`, `USER`)
- Cómo usar los **guards** de autenticación y autorización en controllers
- Cómo validar el **dealershipId** para aislar datos por concesionaria
- Patrones de **login** y **registro** con JWT
- Cómo proteger endpoints según rol requerido

## ¿Cuándo se activa?

Claude lo invoca automáticamente al detectar:

> *"Implementar autenticación"*, *"Trabajar con JWT"*, *"Configurar roles"*, *"Crear guard de auth"*, *"Validar permisos"*, *"Proteger endpoint"*

## Roles del sistema

| Rol | Descripción | Acceso |
|---|---|---|
| `ADMIN` | Administrador global | Todos los recursos de todas las concesionarias |
| `ASESOR` | Asesor de concesionaria | Solo recursos de su propia concesionaria |
| `USER` | Usuario final / cliente | Acceso público limitado |

## Guards disponibles

| Guard | Uso |
|---|---|
| `JwtAuthGuard` | Verifica token JWT válido |
| `RolesGuard` | Verifica que el usuario tenga el rol requerido |

## Instalación rápida

1. Descargá el `SKILL.md` con el botón de arriba
2. Abrí Claude Code en tu terminal
3. Adjuntá el archivo y enviá:

> *"Instalá este skill en `~/.claude/skills/nomadear-auth/SKILL.md`"*

## Nivel de aplicación

**Tipo:** Automático por inferencia | **Nivel:** Avanzado
