---
name: angular
description: >
  Angular moderno con standalone components, signals, OnPush y calidad de código.
  Trigger: crear componente Angular, crear servicio Angular, refactorizar Angular, routing Angular, formularios Angular
license: MIT
metadata:
  author: flock-engineering
  version: '1.0'
  scope: [root]
  auto_invoke:
    - 'Crear componente Angular'
    - 'Crear servicio Angular'
    - 'Refactorizar Angular'
    - 'Routing Angular'
    - 'Formularios Angular'
    - 'Agregar guard Angular'
    - 'Optimizar rendimiento Angular'
allowed-tools: Read, Edit, Write, Glob, Grep
---

# Angular Skill

## Critical Rules

### ALWAYS

- Usar **standalone components** (Angular 17+) — sin NgModules salvo legado
- Declarar `changeDetection: ChangeDetectionStrategy.OnPush` en cada componente
- Usar **signals** (`signal()`, `computed()`, `effect()`) para estado local reactivo
- Tipar completamente con TypeScript strict — sin `any`
- Inyectar dependencias con `inject()` en lugar de constructor injection cuando sea posible
- Usar `DestroyRef` + `takeUntilDestroyed()` para limpiar subscripciones
- Aplicar lazy loading en todas las rutas de feature
- Usar `trackBy` en `*ngFor` / `@for` siempre que se itere una lista
- Validar formularios reactivos con validators tipados
- Manejar errores en observables — nunca dejarlos sin `catchError`

### NEVER

- Usar `NgModules` en código nuevo (solo para compatibilidad con librerías)
- Mutar estado directamente — usar `signal.set()` o `signal.update()`
- Usar `any` en templates o en servicios
- Subscribirse en el template sin `async` pipe o sin cleanup
- Usar `document` o `window` directamente — inyectar `DOCUMENT` o usar `isPlatformBrowser`
- Lógica de negocio en componentes — va en servicios
- Usar `ElementRef.nativeElement` para manipular el DOM — preferir directivas o renderer

---

## Component Pattern (Standalone + Signals)

```typescript
// feature/components/user-card/user-card.component.ts
import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  computed,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserCardComponent {
  // Input signals (Angular 17.1+)
  user = input.required<User>();
  showActions = input<boolean>(false);

  // Output events
  userDeleted = output<string>();

  // Estado local con signal
  isExpanded = signal(false);

  // Derivado con computed
  fullName = computed(() => `${this.user().firstName} ${this.user().lastName}`);

  private readonly userService = inject(UserService);

  toggleExpand(): void {
    this.isExpanded.update((v) => !v);
  }

  onDelete(): void {
    this.userDeleted.emit(this.user().id);
  }
}
```

---

## Service Pattern

```typescript
// feature/services/user.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '@env/environment';
import { User, CreateUserDto } from '../models/user.model';
import { AppError } from '@core/errors/app-error';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/users`;

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl).pipe(
      catchError((err) => throwError(() => new AppError(err.message, err.status))),
    );
  }

  getById(id: string): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${id}`).pipe(
      catchError((err) => throwError(() => new AppError(err.message, err.status))),
    );
  }

  create(dto: CreateUserDto): Observable<User> {
    return this.http.post<User>(this.baseUrl, dto).pipe(
      catchError((err) => throwError(() => new AppError(err.message, err.status))),
    );
  }
}
```

---

## Subscripción con Cleanup (takeUntilDestroyed)

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { DestroyRef } from '@angular/core';
import { UserService } from '../services/user.service';

@Component({ standalone: true, ... })
export class UsersComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly destroyRef   = inject(DestroyRef);

  // Opción 1: convertir Observable a Signal automáticamente
  users = toSignal(this.userService.getAll(), { initialValue: [] });

  // Opción 2: subscribe con cleanup automático
  ngOnInit(): void {
    this.userService.getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((users) => console.log(users));
  }
}
```

---

## Routing con Lazy Loading

```typescript
// app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent,
      ),
  },
  {
    path: 'users',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/users/users.routes').then((m) => m.usersRoutes),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./shared/components/not-found/not-found.component').then(
        (m) => m.NotFoundComponent,
      ),
  },
];
```

---

## Guard (Functional)

```typescript
// core/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) return true;

  return router.createUrlTree(['/login']);
};
```

---

## Formulario Reactivo Tipado

```typescript
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  ...
})
export class CreateUserFormComponent {
  private readonly fb = inject(FormBuilder);

  form = this.fb.group({
    name:  ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    role:  ['USER', Validators.required],
  });

  get nameError(): string | null {
    const ctrl = this.form.controls.name;
    if (!ctrl.dirty) return null;
    if (ctrl.hasError('required'))   return 'El nombre es requerido';
    if (ctrl.hasError('minlength'))  return 'Mínimo 3 caracteres';
    return null;
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue(); // tipado automático
    console.log(value);
  }
}
```

---

## HTTP Interceptor (Funcional)

```typescript
// core/interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '@core/services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth  = inject(AuthService);
  const token = auth.getToken();

  if (!token) return next(req);

  const authReq = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });

  return next(authReq);
};

// app.config.ts
import { provideHttpClient, withInterceptors } from '@angular/common/http';
export const appConfig = {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
};
```

---

## Template — Control Flow (Angular 17+)

```html
<!-- @if / @else — reemplaza *ngIf -->
@if (users().length > 0) {
  <ul>
    @for (user of users(); track user.id) {
      <li>{{ user.name }}</li>
    }
    @empty {
      <li>No hay usuarios</li>
    }
  </ul>
} @else {
  <p>Cargando...</p>
}

<!-- @switch — reemplaza ngSwitch -->
@switch (status()) {
  @case ('active')  { <span class="badge green">Activo</span> }
  @case ('inactive'){ <span class="badge red">Inactivo</span> }
  @default          { <span class="badge gray">Desconocido</span> }
}
```

---

## Commands

```bash
# Generar componente standalone
ng generate component features/users/components/user-card --standalone

# Generar servicio
ng generate service features/users/services/user

# Generar guard funcional
ng generate guard core/guards/auth

# Build producción
ng build --configuration production

# Tests unitarios
ng test

# Linting
ng lint

# Verificar bundle size
ng build --stats-json && npx webpack-bundle-analyzer dist/stats.json
```
