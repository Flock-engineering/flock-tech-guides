---
name: rxjs
description: >
  RxJS con operadores, manejo de errores y prevención de memory leaks.
  Trigger: usar RxJS, crear observable, usar operadores RxJS, Subject, BehaviorSubject, manejar errores observables
license: MIT
metadata:
  author: flock-engineering
  version: '1.0'
  scope: [root]
  auto_invoke:
    - 'Usar RxJS'
    - 'Crear observable'
    - 'Usar operadores RxJS'
    - 'Subject RxJS'
    - 'BehaviorSubject'
    - 'Manejar errores observables'
    - 'Combinar observables'
allowed-tools: Read, Edit, Write, Glob, Grep
---

# RxJS Skill

## Critical Rules

### ALWAYS

- Limpiar **todas** las subscripciones — usar `takeUntilDestroyed()`, `takeUntil()` o `async` pipe
- Usar `catchError` en cada observable que llegue al componente
- Preferir **operadores de combinación** (`combineLatest`, `forkJoin`) sobre subscripciones anidadas
- Usar `BehaviorSubject` para estado compartido que tenga valor inicial
- Exponer observables como `readonly` — nunca el Subject directamente
- Usar `switchMap` para cancelar requests previos (búsqueda, navegación)
- Usar `mergeMap` para requests en paralelo sin cancelar
- Usar `concatMap` para requests que deben ejecutarse en orden
- Tipar explícitamente el genérico: `Observable<User[]>`, `Subject<string>`

### NEVER

- Subscribirse dentro de otra subscripción — usar operadores de flattening
- Olvidar `unsubscribe()` o cleanup — causa memory leaks
- Usar `subscribe()` para encadenar efectos — preferir `tap()`
- Usar `Subject` para estado con valor inicial — usar `BehaviorSubject`
- Exponer un `Subject` público — siempre exponerlo como `Observable` con `.asObservable()`
- Hacer `catchError` que no retorne un observable — siempre `return EMPTY` o `throwError`
- Ignorar el operador correcto de flattening — leer diferencias switchMap/mergeMap/concatMap/exhaustMap

---

## Operadores de Flattening — Cuál Usar

| Operador | Comportamiento | Caso de uso |
|---|---|---|
| `switchMap` | Cancela el anterior | Búsqueda, autocompletado, navegación |
| `mergeMap` | Ejecuta en paralelo | Subir múltiples archivos |
| `concatMap` | Espera al anterior | Acciones que deben ser secuenciales |
| `exhaustMap` | Ignora nuevos mientras el actual está activo | Login, submit de formulario |

```typescript
// switchMap — búsqueda: cancela request anterior si el usuario sigue escribiendo
this.searchInput.valueChanges.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap((term) => this.searchService.search(term)),
).subscribe((results) => (this.results = results));

// exhaustMap — submit: ignora clicks mientras el request está en vuelo
this.submitBtn.clicks.pipe(
  exhaustMap(() => this.authService.login(this.form.value)),
).subscribe(this.handleSuccess);
```

---

## State con BehaviorSubject

```typescript
// services/cart.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import type { CartItem } from '../models/cart.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  // Privado: solo el servicio puede emitir
  private readonly _items = new BehaviorSubject<CartItem[]>([]);

  // Público: solo Observable, no Subject
  readonly items$: Observable<CartItem[]> = this._items.asObservable();
  readonly count$: Observable<number>     = this.items$.pipe(map((i) => i.length));
  readonly total$: Observable<number>     = this.items$.pipe(
    map((items) => items.reduce((sum, item) => sum + item.price * item.quantity, 0)),
  );

  add(item: CartItem): void {
    this._items.update((current) => [...current, item]);  // Angular 16+
    // o en RxJS puro:
    // this._items.next([...this._items.getValue(), item]);
  }

  remove(id: string): void {
    this._items.next(this._items.getValue().filter((i) => i.id !== id));
  }

  clear(): void {
    this._items.next([]);
  }
}
```

---

## Combinación de Observables

```typescript
import { combineLatest, forkJoin, zip, merge } from 'rxjs';

// combineLatest: emite cada vez que cualquiera cambia (todos deben haber emitido al menos 1 vez)
// Caso: pantalla que necesita usuario + permisos actualizados en tiempo real
combineLatest([
  this.userService.currentUser$,
  this.authService.permissions$,
]).pipe(
  map(([user, permissions]) => ({ user, permissions })),
).subscribe(({ user, permissions }) => { /* ... */ });

// forkJoin: espera que todos completen — como Promise.all
// Caso: cargar datos iniciales en paralelo
forkJoin({
  users:    this.userService.getAll(),
  settings: this.settingsService.get(),
  stats:    this.statsService.getSummary(),
}).subscribe(({ users, settings, stats }) => {
  this.initDashboard(users, settings, stats);
});

// merge: emite de cualquiera que llegue primero (en paralelo)
// Caso: múltiples fuentes de notificaciones
merge(
  this.websocket.messages$,
  this.polling.updates$,
).subscribe((notification) => this.showNotification(notification));
```

---

## Manejo de Errores

```typescript
import { catchError, retry, EMPTY, throwError, of } from 'rxjs';

// catchError: recuperarse del error con valor por defecto
this.userService.getAll().pipe(
  catchError((err) => {
    console.error('Error cargando usuarios:', err);
    return of([]); // valor por defecto
  }),
);

// catchError: propagar error tipado
this.userService.getById(id).pipe(
  catchError((err) => throwError(() => new AppError(err.message, err.status))),
);

// retry: reintentar N veces antes de fallar
this.dataService.fetch().pipe(
  retry({ count: 3, delay: 1000 }), // 3 reintentos, 1s entre cada uno
  catchError((err) => {
    this.notifyError(err);
    return EMPTY; // completa sin emitir
  }),
);
```

---

## Cleanup — Prevenir Memory Leaks

```typescript
// Angular: takeUntilDestroyed (Angular 16+) — recomendado
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef, inject } from '@angular/core';

@Component({ ... })
export class MyComponent {
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.someService.data$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(this.handleData);
  }
}

// Alternativa manual con Subject
@Component({ ... })
export class MyComponent implements OnDestroy {
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(this.tick);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

// Alternativa: async pipe en template (limpia automáticamente)
// users$ | async
```

---

## Operadores de Transformación Más Usados

```typescript
import { map, filter, tap, distinctUntilChanged, debounceTime, startWith, scan } from 'rxjs';

// map: transformar valor
users$.pipe(map((users) => users.filter((u) => u.active)));

// filter: filtrar emisiones
events$.pipe(filter((e) => e.type === 'USER_CREATED'));

// tap: efecto secundario sin modificar el valor (logging, debugging)
data$.pipe(tap((v) => console.log('data:', v)));

// distinctUntilChanged: evitar duplicados consecutivos
input$.pipe(distinctUntilChanged());

// debounceTime: esperar N ms sin emisiones
search$.pipe(debounceTime(300));

// startWith: emitir un valor inicial
data$.pipe(startWith([]));

// scan: acumular valores (como reduce, pero emite en cada paso)
clicks$.pipe(scan((count) => count + 1, 0)); // contador

// shareReplay: compartir subscripción y reproducir últimos N valores
const sharedData$ = this.http.get('/api/data').pipe(shareReplay(1));
```

---

## Custom Operator

```typescript
import { MonoTypeOperatorFunction, pipe } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';

// Operator reutilizable para log de debug
function debugLog<T>(label: string): MonoTypeOperatorFunction<T> {
  return tap((value) => console.debug(`[${label}]`, value));
}

// Operator para filtrar nulls con tipado correcto
function filterNull<T>(): MonoTypeOperatorFunction<NonNullable<T>> {
  return filter((v): v is NonNullable<T> => v != null);
}

// Uso
this.user$.pipe(
  filterNull(),             // quita null/undefined con tipado
  debugLog('user'),         // log sin romper la cadena
  map((user) => user.name),
).subscribe(this.setTitle);
```
