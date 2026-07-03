---
id: functional-decision-skill
title: "Claude Skill: Functional Decision"
sidebar_label: "Functional Decision Skill"
---

# Claude Skill: Functional Decision

Skill que guía a Claude para documentar **decisiones funcionales** (de producto o negocio) como registros Markdown versionados dentro del repo. Agnóstico al entorno: no depende de Notion, Jira ni ninguna herramienta — solo archivos en el proyecto.

:::tip Descarga el skill
<DownloadButton to="skills/functional-decision/SKILL.md">⬇ Descargar SKILL.md</DownloadButton> — guardalo en `~/.claude/skills/functional-decision/SKILL.md` para instalarlo directamente.
:::

## El problema que resuelve

Las decisiones funcionales suelen quedar dispersas: un mensaje de Slack, un comentario en un PR, la cabeza de quien la tomó. Seis meses después nadie recuerda **por qué** se decidió así, y se vuelve a discutir lo mismo.

Este skill deja el *por qué* asentado en un registro estable, legible por humanos y con historial en git.

## Qué NO es (para no duplicar)

- **No es SDD.** SDD documenta decisiones atadas a UN cambio técnico. Acá se registra una decisión funcional que trasciende un cambio puntual.
- **No es memoria reactiva.** No reemplaza notas de sesión ni memoria de la IA — es un registro deliberado.
- **No es un zettel.** No es una idea suelta, es una decisión tomada con su justificación.

Si la decisión ya vive en un SDD, el skill la **referencia** en vez de duplicarla.

## ¿Cuándo se activa?

Claude lo invoca automáticamente al detectar:

> *"Documentar una decisión funcional"*, *"Registrar una decisión de producto"*, *"Dejar registrada esta decisión"*, *"Crear un ADR funcional"*

## Cómo funciona

1. **Resuelve la carpeta destino** — busca `docs/decisions/`, `docs/adr/` o `decisions/`. Si no hay ninguna, usa `docs/decisions/` cuando existe `docs/`, o `decisions/` en la raíz. La crea si falta.
2. **Ronda corta de preguntas** — contexto/problema, la decisión, alternativas, el porqué, impacto y participantes. No adivina.
3. **Asigna un ID incremental** — `FD-0001`, `FD-0002`… leyendo los registros existentes.
4. **Escribe el archivo** — `FD-NNNN-titulo.md` con frontmatter completo.
5. **Actualiza el índice** — un `README.md` en la carpeta con la tabla de todas las decisiones.

## Anatomía de un registro

Cada decisión es un archivo con frontmatter y secciones fijas:

| Campo | Para qué |
|---|---|
| `id` | Identificador incremental `FD-NNNN` |
| `title` | Título de la decisión |
| `status` | `propuesta` · `aceptada` · `rechazada` · `reemplazada` · `obsoleta` |
| `date` | Fecha de la decisión (`YYYY-MM-DD`) |
| `deciders` | Quiénes la tomaron |
| `tags` | Áreas o features que toca |
| `supersedes` / `superseded-by` | Trazabilidad cuando una decisión reemplaza a otra |

Y en el cuerpo: **Contexto y problema**, **Decisión**, **Alternativas consideradas**, **Justificación (el porqué)**, **Implicancias e impacto** y **Referencias**.

## Ciclo de vida

Una decisión no es inmutable. Cuando una nueva la reemplaza, se enlazan con `supersedes` / `superseded-by` y la vieja pasa a estado `reemplazada`. El historial queda intacto — nunca se borra una decisión, se marca como superada.

## Instalación rápida

1. Descargá el `SKILL.md` con el botón de arriba
2. Abrí Claude Code en tu terminal
3. Adjuntá el archivo y enviá:

> *"Instalá este skill en `~/.claude/skills/functional-decision/SKILL.md`"*

## Nivel de aplicación

**Tipo:** Automático por inferencia | **Nivel:** Intermedio
