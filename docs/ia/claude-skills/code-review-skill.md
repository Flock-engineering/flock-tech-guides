---
id: code-review-skill
title: "Claude Skill: Code Review"
sidebar_label: "Code Review Skill"
---

# Claude Skill: Code Review

Skill que guía a Claude para realizar code reviews con criterio técnico, sistema de severidades claro y feedback accionable — no solo señalar problemas sino proponer soluciones.

:::tip Descarga el skill
<a href="/flock-tech-guides/skills/code-review/SKILL.md" download="SKILL.md">⬇ Descargar SKILL.md</a> — guardalo en `~/.claude/skills/code-review/SKILL.md` para instalarlo directamente.
:::

## ¿Qué hace?

Cuando Claude hace un code review, este skill le indica:

- Usar el sistema de severidades 🔴/🟡/🟢 en cada comentario
- Ser específico: indicar el problema, el impacto y una sugerencia concreta
- Empezar con un resumen general antes de los comentarios inline
- Reconocer lo que está bien hecho — el feedback no es solo negativo
- Verificar tests: caso feliz, edge cases y casos de error
- Proponer solución cuando se señala un problema
- Priorizar: bugs de seguridad y race conditions antes que estilo

## ¿Cuándo se activa?

Claude lo invoca automáticamente al detectar:

> *"Hacer code review"*, *"Revisar PR"*, *"Revisar código"*, *"Dar feedback de código"*, *"Analizar pull request"*, *"Code review de"*

## Sistema de severidades

| Emoji | Nivel | Significado | ¿Bloquea merge? |
|---|---|---|---|
| 🔴 | Bloqueante | Bug, security issue, pérdida de datos, incorrección lógica | Sí |
| 🟡 | Importante | Deuda técnica significativa, test faltante de edge case | Depende |
| 🟢 | Sugerencia | Mejora de estilo, alternativa opcional, nitpick | No |
| 💡 | Idea | Propuesta para considerar en otro momento | No |
| ❓ | Pregunta | Necesita clarificación antes de evaluar | A veces |

## Formato de comentario

```
🔴 [Bloqueante] — Race condition en creación de orden

Si dos requests llegan simultáneamente, ambos pasan la validación y
crean registros duplicados. Necesita SELECT FOR UPDATE o lock optimista.

Sugerencia:
const existing = await this.repo.findOne(
  { where: { userId } },
  { lock: { mode: 'pessimistic_write' } },
);
```

```
🟢 [Sugerencia] — Magic number

El `3` en `items.slice(0, 3)` es un magic number. Considera:
const MAX_PREVIEW_ITEMS = 3;
items.slice(0, MAX_PREVIEW_ITEMS);
```

## Qué priorizar

**Siempre revisar:**
1. Lógica de negocio incorrecta o incompleta
2. Bugs de seguridad (autenticación, autorización, injection)
3. Pérdida de datos o corrupción de estado
4. Race conditions y concurrencia
5. Falta de manejo de errores en paths críticos

**No bloquear por:**
- Estilo de código (lo maneja el linter)
- Preferencias personales de naming dentro de guía de estilo
- Refactors fuera del scope del PR

## Instalación rápida

1. Descargá el `SKILL.md` con el botón de arriba
2. Abrí Claude Code en tu terminal
3. Adjuntá el archivo y enviá:

> *"Instalá este skill en `~/.claude/skills/code-review/SKILL.md`"*

## Nivel de aplicación

**Tipo:** Automático por inferencia | **Nivel:** Avanzado
