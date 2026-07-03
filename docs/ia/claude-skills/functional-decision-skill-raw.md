---
id: functional-decision-skill-raw
title: "SKILL.md — Functional Decision"
sidebar_label: "SKILL.md"
---

# SKILL.md — Functional Decision

Archivo de instrucciones que Claude usa internamente. Si encontrás algo para mejorar, abrí un PR directamente.

:::info Contribuir
[✏️ Sugerir corrección en GitHub](https://github.com/Flock-engineering/flock-tech-guides/edit/dev/static/skills/functional-decision/SKILL.md) — GitHub te propone hacer fork y PR automáticamente si no tenés permisos de push.
:::

<DownloadButton to="skills/functional-decision/SKILL.md">⬇ Descargar SKILL.md</DownloadButton>

---

`````md
---
name: functional-decision
description: "Trigger: documentar decisión funcional, registrar decisión de producto, ADR funcional, decision record, dejar registrada una decisión. Genera un registro de decisión en markdown dentro del proyecto."
license: MIT
metadata:
  author: gentleman-programming
  version: "1.0"
  scope: [root]
  auto_invoke:
    - 'Documentar una decisión funcional'
    - 'Registrar una decisión de producto'
    - 'Dejar registrada esta decisión'
    - 'Crear un ADR funcional'
allowed-tools: Read, Glob, Grep, Write, Bash
---

# Functional Decision Skill

Genera un **registro de decisión funcional** como archivo Markdown versionado en el repo. Agnóstico al entorno: no depende de Notion, Jira ni ninguna herramienta — solo archivos en el proyecto.

## Cuándo usar

- Se tomó una decisión de **producto / negocio / comportamiento funcional** que trasciende un solo cambio (reglas de negocio, políticas, alcance de una feature, tradeoffs de UX).
- Querés dejar el *por qué* asentado para el futuro, legible por humanos y en git.

## Cuándo NO usar (evitar duplicación)

- Decisión atada a UN cambio técnico → va en el proposal/design de SDD.
- Nota reactiva o memoria de sesión → engram (`mem_save`).
- Idea o concepto suelto → second-brain (zettel).

Si la decisión ya vive en un SDD, **referencialo** en vez de duplicarlo.

## Flujo

1. **Resolver la carpeta destino.** Buscá una carpeta de decisiones existente en este orden: `docs/decisions/`, `docs/adr/`, `decisions/`. Si no hay ninguna: usá `docs/decisions/` cuando exista `docs/`, si no `decisions/` en la raíz. Preguntá solo si es ambiguo. Creá la carpeta si falta.
2. **Ronda corta de preguntas.** No adivines. Preguntá lo mínimo para completar: contexto/problema, la decisión, alternativas consideradas, justificación (el porqué), implicancias/impacto, participantes. Pocas preguntas, concretas.
3. **Asignar ID.** Leé los archivos `FD-*.md` de la carpeta y calculá el próximo `FD-NNNN` (4 dígitos, incremental desde `FD-0001`).
4. **Escribir el registro.** Creá `FD-NNNN-titulo-en-kebab.md` a partir de la plantilla de abajo, completando el frontmatter y todas las secciones. Fecha en formato `YYYY-MM-DD`.
5. **Actualizar el índice.** Mantené un `README.md` en la carpeta con una tabla `| ID | Título | Estado | Fecha |`. Crealo si no existe; agregá la fila nueva sin pisar las anteriores.

## Reglas

- **Una decisión por archivo.** Nunca mezcles dos decisiones en un registro.
- **Estado** del ciclo de vida: `propuesta | aceptada | rechazada | reemplazada | obsoleta`.
- Si esta decisión **reemplaza** a otra, seteá `supersedes` acá y `superseded-by` en la vieja, y cambiá el estado de la vieja a `reemplazada`.
- Conciso y accionable. El registro se lee en 30 segundos.
- No inventes participantes, tickets ni fechas: si no los sabés, preguntá o dejalos vacíos.

## Plantilla

```markdown
---
id: FD-NNNN
title: <título de la decisión>
status: propuesta
date: YYYY-MM-DD
deciders: []
tags: []
supersedes: null
superseded-by: null
---

# FD-NNNN: <título de la decisión>

## Contexto y problema

<Qué situación o necesidad de negocio/producto motivó esta decisión. El estado actual y por qué requiere una definición ahora.>

## Decisión

<Qué se decidió, en una frase clara y afirmativa.>

## Alternativas consideradas

- **<opción A>** — pros / contras / por qué no se eligió
- **<opción B>** — pros / contras / por qué no se eligió

## Justificación (el porqué)

<El razonamiento detrás de la decisión: reglas de negocio, tradeoffs de producto, impacto esperado, datos que la respaldan.>

## Implicancias e impacto

<Qué cambia a partir de esta decisión, a quién o a qué features afecta, riesgos asumidos y qué queda por seguir.>

## Referencias

<Links a tickets, PRs, specs de SDD, conversaciones o documentos relacionados. Dejar vacío si no aplica.>
```
`````
