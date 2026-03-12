---
id: rxjs-skill
title: "Claude Skill: RxJS"
sidebar_label: "RxJS Skill"
---

# Claude Skill: RxJS

Skill que guía a Claude para escribir código RxJS con los operadores de flattening correctos, prevención de memory leaks y manejo de errores en observables.

:::tip Descarga el skill
<a href="/flock-tech-guides/skills/rxjs/SKILL.md" download="SKILL.md">⬇ Descargar SKILL.md</a> — guardalo en `~/.claude/skills/rxjs/SKILL.md` para instalarlo directamente.
:::

## ¿Qué hace?

Cuando Claude escribe o refactoriza código RxJS, este skill le indica:

- Limpiar **todas** las subscripciones con `takeUntilDestroyed()`, `takeUntil()` o `async` pipe
- Usar `catchError` en cada observable que llegue al componente
- Elegir el operador de flattening correcto: `switchMap`, `mergeMap`, `concatMap` o `exhaustMap`
- Usar `BehaviorSubject` para estado compartido con valor inicial
- Exponer observables como `readonly` — nunca el Subject directamente
- Combinar observables con `combineLatest`, `forkJoin` o `merge` en lugar de subscripciones anidadas
- Tipar explícitamente los genéricos: `Observable<User[]>`, `Subject<string>`

## ¿Cuándo se activa?

Claude lo invoca automáticamente al detectar:

> *"Usar RxJS"*, *"Crear observable"*, *"Usar operadores RxJS"*, *"Subject RxJS"*, *"BehaviorSubject"*, *"Manejar errores observables"*, *"Combinar observables"*

## Reglas de calidad

| Regla | Descripción |
|---|---|
| **Sin subscripciones anidadas** | Usar operadores de flattening |
| **Sin Subject público** | Exponerlo como `Observable` con `.asObservable()` |
| **`catchError` siempre** | Retornar `EMPTY`, `of(fallback)` o `throwError` |
| **Cleanup obligatorio** | `takeUntilDestroyed`, `takeUntil` o `async` pipe |
| **Operador correcto** | `switchMap` cancela, `mergeMap` paralelo, `exhaustMap` ignora |
| **Sin `Subject` para estado** | Usar `BehaviorSubject` cuando hay valor inicial |

## Operadores de flattening — cuál usar

| Operador | Comportamiento | Caso de uso |
|---|---|---|
| `switchMap` | Cancela el anterior | Búsqueda, autocompletado, navegación |
| `mergeMap` | Ejecuta en paralelo | Subir múltiples archivos |
| `concatMap` | Espera al anterior | Acciones secuenciales |
| `exhaustMap` | Ignora nuevos mientras activo | Login, submit de formulario |

## Estado con BehaviorSubject

```typescript
@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly _items = new BehaviorSubject<CartItem[]>([]);

  // Solo se expone el Observable, nunca el Subject
  readonly items$: Observable<CartItem[]> = this._items.asObservable();
  readonly count$: Observable<number>     = this.items$.pipe(map((i) => i.length));

  add(item: CartItem): void {
    this._items.next([...this._items.getValue(), item]);
  }
}
```

## Instalación rápida

1. Descargá el `SKILL.md` con el botón de arriba
2. Abrí Claude Code en tu terminal
3. Adjuntá el archivo y enviá:

> *"Instalá este skill en `~/.claude/skills/rxjs/SKILL.md`"*

## Nivel de aplicación

**Tipo:** Automático por inferencia | **Nivel:** Avanzado
