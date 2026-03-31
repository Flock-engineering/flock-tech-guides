---
id: slack-gif-creator-skill
title: "Claude Skill: Creador de GIFs para Slack"
sidebar_label: "Slack GIF Creator"
---

# Claude Skill: Creador de GIFs para Slack

Skill que guía a Claude para **crear GIFs animados optimizados para Slack** — tanto emojis (128x128) como GIFs de mensajes (480x480) — usando PIL con animaciones creativas, easing y validación automática de los requisitos de Slack.

:::tip Descarga el skill
<a href="/flock-tech-guides/skills/slack-gif-creator/SKILL.md" download="SKILL.md">⬇ Descargar SKILL.md</a> — guardalo en `~/.claude/skills/slack-gif-creator/SKILL.md` para instalarlo directamente.
:::

## ¿Qué hace?

Cuando Claude necesita crear un GIF para Slack, este skill le indica:

- Respetar las **dimensiones y parámetros** exactos que requiere Slack (FPS, colores, tamaño)
- Usar `GIFBuilder` para armar frames y optimizar el output automáticamente
- Aplicar **funciones de easing** para movimientos fluidos (bounce, elastic, ease_in_out y más)
- Dibujar con **PIL ImageDraw** — sin asumir assets externos ni fonts de emoji
- Validar el GIF contra los requisitos de Slack antes de entregar
- Crear animaciones **pulidas y creativas** — no placeholder básico

## ¿Cuándo se activa?

Claude lo invoca automáticamente al detectar:

> *"Crear un GIF para Slack"*, *"Hacer un emoji animado"*, *"GIF de X haciendo Y para Slack"*, *"Animar esto para Slack"*

## Requisitos de Slack

| Tipo | Dimensiones | FPS | Colores | Duración |
|---|---|---|---|---|
| Emoji GIF | 128x128 | 10-30 | 48-128 | Hasta 3 segundos |
| Message GIF | 480x480 | 10-30 | 48-128 | Libre |

## Utilidades disponibles

| Utilidad | Módulo | Propósito |
|---|---|---|
| **GIFBuilder** | `core.gif_builder` | Arma frames y optimiza para Slack |
| **Validators** | `core.validators` | Valida que el GIF cumpla los requisitos |
| **Easing** | `core.easing` | Movimientos fluidos (bounce, elastic, etc.) |
| **Frame Helpers** | `core.frame_composer` | Fondos, círculos, texto, estrellas |

## Conceptos de animación soportados

- **Shake/Vibrate** — oscillación con `math.sin()`
- **Pulse/Heartbeat** — escala rítmica con sine wave
- **Bounce** — caída con `easing='bounce_out'`
- **Spin/Rotate** — rotación con PIL o wobble via sine
- **Fade In/Out** — canal alpha en RGBA
- **Slide** — movimiento desde fuera del frame con easing
- **Zoom** — escala de 0.1 a 2.0
- **Explode/Particle Burst** — partículas con física básica

## Instalación rápida

1. Descargá el `SKILL.md` con el botón de arriba
2. Abrí Claude Code en tu terminal
3. Adjuntá el archivo y enviá:

> *"Instalá este skill en `~/.claude/skills/slack-gif-creator/SKILL.md`"*

## Dependencias

```bash
pip install pillow imageio numpy
```

## Nivel de aplicación

**Tipo:** Automático por inferencia | **Nivel:** Intermedio | **Output:** `.gif` | **Slack:** ✅
