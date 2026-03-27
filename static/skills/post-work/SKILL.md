---
name: post-work
description: >
  Muestra un resumen de ejecución al finalizar cada tarea: modelo, duración, tokens,
  sub-agentes utilizados y checklist de lo guardado en Engram.
  Trigger: siempre activo — se ejecuta automáticamente al completar cualquier tarea
license: MIT
metadata:
  author: flock-engineering
  version: '1.0'
  scope: [root]
  auto_invoke:
    - 'tarea completada'
    - 'listo'
    - 'done'
    - 'terminé'
    - 'finalizado'
allowed-tools: Read
---

# Post-Work Skill

## Critical Rules

### ALWAYS

- Mostrar el bloque PostWork al finalizar TODA tarea significativa
- Incluir modelo, duración estimada y tokens consumidos
- Listar cada sub-agente utilizado en una tabla (nombre descriptivo, duración, tokens)
- Mostrar el checklist de Engram con lo que se guardó en esta sesión
- Usar `~` para indicar valores estimados (duración, tokens si no están disponibles exactos)
- Omitir la tabla de sub-agentes si no se usó ninguno en la tarea
- Marcar con ✅ las observaciones guardadas y ⬜ las pendientes o decididas no guardar

### NEVER

- Inventar valores de tokens o duración — usar `~` si son estimados
- Mostrar el bloque en respuestas triviales (saludos, preguntas cortas sin código)
- Omitir el bloque en tareas que involucren creación de archivos, código o decisiones importantes
- Listar en Engram items que no se guardaron como guardados

---

## Formato del Bloque PostWork

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 POST-WORK SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 Model        {model-id}
 Duration     ~{Xm Ys}
 Tokens       {total} total (input: {Xk} / output: {Yk})

 Sub-agents
 ┌─────────────────────────────┬──────────┬──────────────┐
 │ Agent                       │ Duration │ Tokens       │
 ├─────────────────────────────┼──────────┼──────────────┤
 │ {nombre descriptivo}        │ ~{Xm Ys} │ {N}          │
 └─────────────────────────────┴──────────┴──────────────┘

 Engram
 ✅ Guardado: {descripción breve de lo guardado}
 ⬜ Pendiente: {descripción de lo que falta guardar, si aplica}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Reglas de Cada Campo

### Model
Usar el model ID exacto de la sesión. Ejemplos:
- `claude-sonnet-4-6`
- `claude-opus-4-6`
- `claude-haiku-4-5-20251001`

### Duration
Estimación basada en la complejidad de la tarea. Siempre con prefijo `~`.

| Tipo de tarea              | Referencia     |
|----------------------------|----------------|
| Respuesta simple           | < 30s          |
| Edición de 1-3 archivos    | ~30s – 1m      |
| Feature con sub-agentes    | ~1m – 5m       |
| Tarea compleja multi-fase  | ~5m – 15m      |

### Tokens
Si están disponibles en el contexto (tool results, usage metadata), mostrar exactos.
Si no, estimarlos con `~` y redondear a miles (ej: `~12k`).

Formato: `{total} total (input: {Xk} / output: {Yk})`

### Sub-agents (tabla)
Mostrar SOLO si se invocó al menos un sub-agente (Agent tool).
- **Agent**: nombre descriptivo que se pasó al agente (3-5 palabras)
- **Duration**: estimado del tiempo que tomó
- **Tokens**: tokens consumidos por ese agente si están disponibles

Si no se usaron sub-agentes, omitir la sección completa (no mostrar tabla vacía).

### Engram
Listar cada observación guardada con `mem_save` durante la tarea.
- ✅ para items efectivamente guardados
- ⬜ para items que quedaron pendientes o se decidió no guardar (con razón breve)

Si no se guardó nada ni hay pendientes, omitir la sección.

---

## Ejemplo Completo — Con Sub-agentes

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 POST-WORK SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 Model        claude-sonnet-4-6
 Duration     ~3m 42s
 Tokens       89,341 total (input: 84.1k / output: 5.2k)

 Sub-agents
 ┌─────────────────────────────┬──────────┬──────────────┐
 │ Agent                       │ Duration │ Tokens       │
 ├─────────────────────────────┼──────────┼──────────────┤
 │ Explorar estructura skills  │ ~1m 40s  │ 61,646       │
 │ Validar sidebar Docusaurus  │ ~25s     │ 8,204        │
 └─────────────────────────────┴──────────┴──────────────┘

 Engram
 ✅ Guardado: estructura de skills en flock-tech-guides
 ✅ Guardado: convención de 3 archivos por skill (static + docs x2)
 ⬜ Pendiente: confirmar skill PostWork antes de crear archivos

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Ejemplo Mínimo — Sin Sub-agentes

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 POST-WORK SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 Model        claude-sonnet-4-6
 Duration     ~45s
 Tokens       ~4,200 total (input: ~3.8k / output: ~400)

 Engram
 ✅ Guardado: fix en query N+1 del endpoint /users

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Cuándo NO mostrar el bloque

| Situación                            | ¿Mostrar? |
|--------------------------------------|-----------|
| Respuesta a pregunta corta           | No        |
| Saludo o mensaje de inicio           | No        |
| Clarificación o pregunta de vuelta   | No        |
| Edición de código o archivos         | Sí        |
| Creación de archivos nuevos          | Sí        |
| Decisión arquitectónica documentada  | Sí        |
| Tarea completada con sub-agentes     | Sí        |
| Bug fix con causa raíz identificada  | Sí        |
