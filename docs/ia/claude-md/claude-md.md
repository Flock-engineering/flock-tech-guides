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

---

## Rutear modelos por subagente

Cuando trabajas con un orquestador que delega tareas a subagentes, no todos los subagentes necesitan el mismo modelo. Diseñar una arquitectura pide un modelo potente; renombrar variables o cerrar un ticket, no. Desde tu `CLAUDE.md` podes indicarle a la IA que use un modelo distinto para cada subagente segun la tarea.

:::note[No es config, es una instruccion]
El `CLAUDE.md` no *configura* el modelo de un subagente — es contexto que la IA lee. Lo que haces aca es escribir una **instruccion** que hace que el orquestador pase el modelo correcto en el momento de invocar cada subagente. Es instruction-following, no un binding garantizado.
:::

### El patron: tabla modelo-por-subagente

La forma mas clara es una tabla que mapee cada subagente (o fase de trabajo) a un modelo, seguida de una regla que obligue a respetarla. Este bloque va dentro de tu `CLAUDE.md`:

```markdown
## Asignacion de modelos

| Subagente / Fase        | Modelo | Por que                     |
| ----------------------- | ------ | --------------------------- |
| Diseno / arquitectura   | opus   | decisiones complejas        |
| Implementacion          | sonnet | trabajo estructurado        |
| Tareas mecanicas / cierre | haiku | rapido y barato             |

Regla: toda delegacion a un subagente DEBE incluir el `model` mapeado en
esta tabla. Si no hay match, usa `sonnet` por defecto.
```

Con eso, cada vez que el orquestador delega, arranca leyendo la tabla y pasa el `model` correspondiente.

### Ejemplo: asignacion para un flujo SDD

Si usas [Spec-Driven Development](../handbook/setup-sdd), cada fase la ejecuta un sub-agente distinto con necesidades distintas: las fases que deciden arquitectura piden un modelo potente, las mecanicas se resuelven con uno barato. Esta es una tabla de **sugerencia** para arrancar — ajustala segun tu presupuesto y la complejidad de tus cambios:

```markdown
| Fase SDD  | Modelo | Por que                              |
| --------- | ------ | ------------------------------------ |
| explore   | sonnet | lee codigo, estructural no arquitectonico |
| propose   | opus   | decide intencion, scope y enfoque    |
| spec      | sonnet | escritura estructurada de requerimientos |
| design    | opus   | decisiones de arquitectura           |
| tasks     | sonnet | breakdown mecanico en checklist      |
| apply     | sonnet | implementacion siguiendo el diseño   |
| verify    | sonnet | validacion contra specs              |
| archive   | haiku  | sincroniza y cierra, puro copy       |
| (default) | sonnet | cualquier delegacion fuera de SDD    |
```

La logica: **opus solo donde se piensa** (propose, design), **haiku donde se copia** (archive), y **sonnet para el resto** — el caballo de batalla que balancea costo y calidad en el trabajo estructurado.

### Por que funciona

Claude Code resuelve el modelo de un subagente por prioridad, y el modelo que se pasa **en el momento de la invocacion gana** sobre el que el subagente tenga definido por su cuenta. Como tu instruccion opera justo en ese nivel, tu tabla manda.

Los valores validos para `model` son los alias `opus`, `sonnet`, `haiku` y `fable` — cada alias apunta a la ultima version de ese modelo, asi no quedas viejo. Si necesitas una version exacta y fija, tambien podes pinnear el ID completo (ej: `claude-opus-4-8`).

### Cuando conviene

El objetivo es optimizar **costo y latencia por tarea**. Un mismo pipeline puede gastar un modelo caro y lento solo donde aporta (diseno, arquitectura, decisiones) y caer a uno barato y rapido para el laburo mecanico (formateo, cierres, copia). Un solo `CLAUDE.md` rutea todo el flujo sin que tengas que pensarlo en cada delegacion.

:::info[Un detalle honesto]
Esto depende de que la IA respete la regla y de que la herramienta de invocacion acepte un parametro `model`. No es tan robusto como fijar el modelo directamente en la definicion del subagente. Si ademas queres controlarlo por entorno, existe la variable `CLAUDE_CODE_SUBAGENT_MODEL` (ver [Configuracion de Claude Code](../claude-code-settings)).
:::
