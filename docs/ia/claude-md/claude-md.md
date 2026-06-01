---
id: claude-md
sidebar_label: Introduccion
---

# CLAUDE.md — Templates por Stack

---

## Que es el CLAUDE.md

El `CLAUDE.md` es el archivo de instrucciones que Claude Code lee automaticamente cada vez que abris un proyecto. Define las reglas, convenciones y arquitectura especificas de TU repositorio. Si no lo conoces, leete primero la [seccion del Handbook](../handbook/setup-skills-claude-md).

---

## Estructura de los templates

Cada template tiene dos secciones principales:

1. **Reglas de comportamiento** — Son universales, aplican a cualquier proyecto sin importar el stack. Definen como debe pensar, proponer y ejecutar la IA. Esta seccion es identica en todos los templates.

2. **Seccion de stack** — Es donde vos defines las convenciones especificas de tu proyecto: estructura de carpetas, patrones, naming, testing, tooling, etc. Cada template trae un placeholder que tenes que completar con las reglas reales de tu equipo.

3. **Tono** — Define como te habla la IA: en que idioma, con que nivel de formalidad, que tan directo es, si explica mucho o poco. Los templates traen un default que podés editar libremente. Si preferís que te hable en ingles formal, o que sea mas didactico, cambialo. Esta seccion es puramente de preferencia — no afecta la calidad del codigo.

---

## Tooling: como personalizar las herramientas

Cada template incluye dos niveles de reglas de tooling:

**Herramientas de CLI (genérica)** — En la seccion de comportamiento hay una regla que le dice a la IA que use `bat`, `rg`, `fd`, `sd` y `eza` en lugar de `cat`, `grep`, `find`, `sed` y `ls` cuando cae al Bash. Son herramientas modernas que respetan `.gitignore`, son mas rapidas y tienen mejores defaults. Si tu equipo prefiere las clasicas, edita esa regla.

**Tooling del stack (específica)** — Dentro de la seccion de stack hay un bloque `### Tooling` con el package manager y herramientas de scaffolding recomendadas para ese stack (ej: `pnpm` en Node, `./mvnw` en Java). Estos son ejemplos — **editalos para que reflejen lo que usa tu equipo**. Los comentarios `<!-- Ajusta estos comandos... -->` en el archivo raw te indican exactamente que personalizar.

Sin estas reglas, la IA elige herramientas por su cuenta y puede generar comandos inconsistentes con tu proyecto (ej: `npm install` cuando tu lockfile es de `pnpm`).

**Tono (preferencia)** — Cada template incluye un bloque `### Tono` que define como te habla la IA. El default es español rioplatense, directo y sin relleno. Si tu equipo prefiere ingles, o un estilo mas formal, edita esa seccion. No cambia el codigo que genera — solo como se comunica con vos.

**Skills auto-load (opcional)** — Si usas [Claude Skills](../handbook/setup-skills-claude-md), podes agregar una tabla dentro de la seccion de stack que mapee contextos a skills. Esto fuerza la carga explicita del skill cuando la IA detecta ese contexto, en vez de depender de la deteccion automatica. Los templates traen un ejemplo comentado que podes descomentar y adaptar. Si no usas skills, ignora esa seccion.

---

## Como usar estos templates

1. Elegí el template que matchee tu stack en la barra lateral
2. Copialo a la raiz de tu repo como `CLAUDE.md`
3. Completa la seccion de stack con las convenciones reales de tu proyecto
4. Itera — a medida que descubras patrones o reglas nuevas, agregalas

:::tip[Empeza simple]
No intentes cubrir todo en la primera version. Un CLAUDE.md con 10 reglas claras es mejor que uno con 50 reglas genericas. Anda agregando a medida que trabajes con la IA y veas que necesita mas contexto.
:::
