---
id: webapp-testing-skill
title: "Claude Skill: Testing de Web Apps"
sidebar_label: "Webapp Testing"
---

# Claude Skill: Testing de Web Apps

Skill que guía a Claude para **interactuar y testear aplicaciones web locales usando Playwright**, con soporte para captura de screenshots, inspección del DOM, manejo del ciclo de vida del servidor y captura de logs de browser.

:::tip Descarga el skill
<a href="/flock-tech-guides/skills/webapp-testing/SKILL.md" download="SKILL.md">⬇ Descargar SKILL.md</a> — guardalo en `~/.claude/skills/webapp-testing/SKILL.md` para instalarlo directamente.
:::

## ¿Qué hace?

Cuando Claude necesita testear o automatizar una web app, este skill le indica:

- Usar **Python Playwright nativo** — nunca inventar soluciones ad-hoc
- Aplicar el patrón **reconocimiento → acción**: tomar screenshot o inspeccionar el DOM antes de ejecutar acciones
- Esperar siempre `networkidle` antes de inspeccionar apps dinámicas — evita el error más común
- Usar el script `with_server.py` para manejar el ciclo de vida del servidor en lugar de levantarlo manualmente
- Soportar **múltiples servidores** simultáneos (ej: backend + frontend)
- Lanzar Chromium siempre en modo **headless**
- Identificar selectores desde el DOM renderizado, nunca asumir su estructura

## ¿Cuándo se activa?

Claude lo invoca automáticamente al detectar:

> *"Testear la web app"*, *"Capturar screenshot"*, *"Probar el frontend"*, *"Automatizar el browser"*, *"Inspeccionar el DOM"*, *"Ver logs del browser"*

## Árbol de decisión

| Situación | Acción |
|---|---|
| HTML estático | Leer el archivo directamente → identificar selectores → escribir script |
| App dinámica sin servidor activo | Usar `with_server.py` para levantar el servidor |
| App dinámica con servidor activo | Navegar → esperar `networkidle` → inspeccionar → actuar |

## Patrones principales

### Script con servidor automático

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto('http://localhost:5173')
    page.wait_for_load_state('networkidle')  # CRÍTICO en apps dinámicas
    # ... lógica de automatización
    browser.close()
```

### Reconocimiento del DOM

```python
page.screenshot(path='/tmp/inspect.png', full_page=True)
content = page.content()
page.locator('button').all()
```

## Cobertura de herramientas

| Herramienta | Propósito |
|---|---|
| **Playwright** | Automatización y testing de browser |
| `with_server.py` | Gestión del ciclo de vida del servidor |
| `element_discovery.py` | Descubrimiento de selectores |
| `console_logging.py` | Captura de logs del browser |

## Instalación rápida

1. Descargá el `SKILL.md` con el botón de arriba
2. Abrí Claude Code en tu terminal
3. Adjuntá el archivo y enviá:

> *"Instalá este skill en `~/.claude/skills/webapp-testing/SKILL.md`"*

## Nivel de aplicación

**Tipo:** Automático por inferencia | **Nivel:** Intermedio | **Browser:** Chromium headless | **Framework:** Playwright
