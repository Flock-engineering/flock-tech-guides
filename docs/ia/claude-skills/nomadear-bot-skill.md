---
id: nomadear-bot-skill
title: "Claude Skill: Bot IA Nomadear"
sidebar_label: "Nomadear Bot Skill"
---

# Claude Skill: Bot IA Nomadear

Skill que guía a Claude para trabajar con el módulo de bot del proyecto Nomadear, basado en **Google Vertex AI Discovery Engine** para responder preguntas sobre eventos y registros.

:::tip Descarga el skill
<a href="/flock-tech-guides/skills/nomadear-bot/SKILL.md" download="SKILL.md">⬇ Descargar SKILL.md</a> — guardalo en `~/.claude/skills/nomadear-bot/SKILL.md` para instalarlo directamente.
:::

## ¿Qué hace?

Cuando Claude trabaja con el módulo bot, este skill le indica:

- La estructura del endpoint `POST /bot/ask`
- Las **variables de entorno** necesarias para GCP y Discovery Engine
- El flujo de autenticación con **Google Application Credentials**
- Cómo configurar la llamada a **Vertex AI Discovery Engine**
- Los archivos clave del módulo y cómo extenderlos
- Manejo de errores específicos de la integración GCP

## ¿Cuándo se activa?

Claude lo invoca automáticamente al detectar:

> *"Trabajar con el bot"*, *"Configurar Vertex AI"*, *"Modificar Discovery Engine"*, *"Manejar credenciales GCP"*

## Stack del módulo

| Componente | Tecnología |
|---|---|
| **Motor IA** | Google Vertex AI Discovery Engine |
| **Auth GCP** | Google Application Default Credentials |
| **Endpoint** | `POST /bot/ask` |
| **Framework** | NestJS 11 |

## Variables de entorno requeridas

```bash
GCP_PROJECT_ID=...
GCP_LOCATION=...
DISCOVERY_ENGINE_ID=...
GOOGLE_APPLICATION_CREDENTIALS=./gcp-credentials.json
```

## Instalación rápida

1. Descargá el `SKILL.md` con el botón de arriba
2. Abrí Claude Code en tu terminal
3. Adjuntá el archivo y enviá:

> *"Instalá este skill en `~/.claude/skills/nomadear-bot/SKILL.md`"*

## Nivel de aplicación

**Tipo:** Manual | **Nivel:** Avanzado
