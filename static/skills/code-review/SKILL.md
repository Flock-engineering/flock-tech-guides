---
name: code-review
description: >
  Code review con criterio técnico, severidades claras y feedback accionable.
  Trigger: hacer code review, revisar PR, revisar código, dar feedback de código, analizar pull request
license: MIT
metadata:
  author: flock-engineering
  version: '1.0'
  scope: [root]
  auto_invoke:
    - 'Hacer code review'
    - 'Revisar PR'
    - 'Revisar código'
    - 'Dar feedback de código'
    - 'Analizar pull request'
    - 'Code review de'
allowed-tools: Read, Glob, Grep, Bash
---

# Code Review Skill

## Critical Rules

### ALWAYS

- Usar el sistema de severidades 🔴/🟡/🟢 en cada comentario
- Ser específico: indicar el problema, el impacto y una sugerencia concreta
- Distinguir entre bloqueante (🔴), mejora importante (🟡) y sugerencia menor (🟢)
- Empezar el review con un resumen general antes de los comentarios inline
- Reconocer lo que está bien hecho — el feedback no es solo negativo
- Proponer solución cuando se señala un problema
- Enfocarse en el código, no en la persona
- Verificar tests: ¿el caso feliz está cubierto? ¿y los edge cases?

### NEVER

- Bloquear un PR por preferencias de estilo que el linter ya maneja
- Hacer comentarios vagos ("esto está mal", "refactorizar esto")
- Cambiar el alcance del PR en el review — abrir issue separado si es necesario
- Aprobar sin leer el código — no es un trámite
- Pedir cambios sin explicar el por qué
- Acumular feedback sin priorizar — si hay 20 comentarios, indicar cuáles son bloqueantes

---

## Sistema de Severidades

| Emoji | Nivel | Significado | ¿Bloquea merge? |
|---|---|---|---|
| 🔴 | Bloqueante | Bug, security issue, pérdida de datos, incorrección lógica | Sí |
| 🟡 | Importante | Deuda técnica significativa, legibilidad crítica, falta de test de caso edge | Depende |
| 🟢 | Sugerencia | Mejora de estilo, alternativa opcional, nitpick | No |
| 💡 | Idea | Propuesta para considerar en otro momento | No |
| ❓ | Pregunta | Necesita clarificación antes de evaluar | A veces |

---

## Formato de Comentario

```
🔴 [Bloqueante] — Race condition en concurrencia

Si dos requests llegan simultáneamente, ambos pueden pasar la validación
y crear registros duplicados. Necesita lock optimista o transacción con
SELECT FOR UPDATE.

Sugerencia:
```typescript
const existing = await this.repo.findOne(
  { where: { userId } },
  { lock: { mode: 'pessimistic_write' } },
);
```
```

```
🟡 [Importante] — Falta test para el caso de usuario inactivo

`deactivateUser()` tiene lógica de negocio que no está cubierta: cuando
el usuario ya está inactivo debería retornar un error específico, no silenciar.

```typescript
it('should throw if user is already inactive', async () => {
  // arrange, act, assert
});
```
```

```
🟢 [Sugerencia] — Nombrar la constante

El `3` en `items.slice(0, 3)` es un magic number. Considera:
```typescript
const MAX_PREVIEW_ITEMS = 3;
items.slice(0, MAX_PREVIEW_ITEMS);
```
```

---

## Checklist de Review

### Corrección
- [ ] La lógica implementa correctamente el requerimiento
- [ ] Los edge cases están contemplados (null, empty, límites)
- [ ] No hay race conditions ni problemas de concurrencia
- [ ] Los errores se manejan y propagan correctamente

### Seguridad
- [ ] No hay datos sensibles en logs
- [ ] Los inputs están validados y sanitizados
- [ ] No hay SQL injection ni XSS potential
- [ ] Los endpoints requieren autenticación/autorización correcta
- [ ] No hay secrets hardcodeados

### Calidad de Código
- [ ] Las funciones tienen una sola responsabilidad
- [ ] No hay duplicación que pueda extraerse
- [ ] Los nombres de variables/funciones son descriptivos
- [ ] La complejidad ciclomática es razonable (< 10 por función)
- [ ] No hay `any` sin justificación en TypeScript

### Tests
- [ ] El caso feliz está cubierto
- [ ] Los casos de error están cubiertos
- [ ] Los mocks son correctos y no ocultan bugs reales
- [ ] Los tests tienen nombres descriptivos

### Performance
- [ ] No hay N+1 queries
- [ ] Las consultas tienen índices adecuados
- [ ] No hay loops costosos en hot paths
- [ ] Los recursos externos se cierran correctamente

---

## Estructura del Review

```markdown
## Resumen

✅ El approach general es correcto. La abstracción del service está bien separada.

🔴 Hay un bug de concurrencia en `createOrder` que puede generar duplicados.
🟡 Faltan tests para los casos de error del payment service.
🟢 Algunas sugerencias de nombres y extracción de constantes.

---

### Comentarios inline

[...los comentarios con severidad...]
```

---

## Qué Priorizar en el Review

**Siempre revisar:**
1. Lógica de negocio incorrecta o incompleta
2. Bugs de seguridad (autenticación, autorización, injection)
3. Pérdida de datos o corrupción de estado
4. Race conditions y concurrencia
5. Falta de manejo de errores en paths críticos

**Revisar si es relevante al PR:**
6. Tests faltantes o incorrectos
7. Performance en hot paths
8. Legibilidad y mantenibilidad

**No bloquear por:**
- Estilo de código (lo maneja el linter)
- Preferencias personales de naming dentro de guía de estilo
- Refactors fuera del scope del PR (abrir issue)
- Mejoras "nice to have" sin impacto funcional

---

## Anti-patterns de Review

```markdown
❌ MAL: "Esto está mal."
✅ BIEN: "🔴 El método `calculateTax()` no considera el caso donde `amount` es
negativo. Con -100, retorna un impuesto positivo incorrecto. Agregar validación
al inicio: `if (amount < 0) throw new InvalidAmountError(amount)`"

❌ MAL: "Yo lo haría diferente."
✅ BIEN: "💡 Alternativa para considerar: usar `Map` en vez de `filter().find()`
reduciría la complejidad de O(n²) a O(n) si la lista crece."

❌ MAL: "¿Por qué hiciste esto así?"
✅ BIEN: "❓ ¿El `setTimeout(0)` es intencional? No encuentro el caso que lo
justifica. Si es para diferir ejecución, considera si hay una mejor alternativa."

❌ MAL: Aprobar sin leer porque "confío en el dev".
✅ BIEN: Leer, aprobar con comentarios menores, y dejar claro cuáles bloquean.
```
