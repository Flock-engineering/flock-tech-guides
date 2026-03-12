---
id: angular-skill
title: "Claude Skill: Angular moderno"
sidebar_label: "Angular Skill"
---

# Claude Skill: Angular moderno

Skill que guía a Claude para escribir Angular 17+ con **standalone components**, signals, OnPush y buenas prácticas — sin NgModules en código nuevo, con lazy loading siempre activo y cleanup correcto de subscripciones.

:::tip Descarga el skill
<a href="/flock-tech-guides/skills/angular/SKILL.md" download="SKILL.md">⬇ Descargar SKILL.md</a> — guardalo en `~/.claude/skills/angular/SKILL.md` para instalarlo directamente.
:::

## ¿Qué hace?

Cuando Claude escribe código Angular, este skill le indica:

- **Standalone components** con `ChangeDetectionStrategy.OnPush` por defecto
- **Signals** (`signal()`, `computed()`, `effect()`) para estado local reactivo
- **`inject()`** en vez de constructor injection
- **`takeUntilDestroyed()`** para cleanup automático de subscripciones
- **Lazy loading** en todas las rutas de feature
- **Functional guards** en vez de clases
- **Formularios reactivos tipados** con validators y mensajes de error
- **HTTP interceptors funcionales** para auth
- **Control flow** de Angular 17+ (`@if`, `@for`, `@switch`)

## ¿Cuándo se activa?

Claude lo invoca automáticamente al detectar:

> *"Crear componente Angular"*, *"Crear servicio Angular"*, *"Routing Angular"*, *"Formularios Angular"*, *"Optimizar rendimiento Angular"*

## Reglas de calidad

| Regla | Descripción |
|---|---|
| **Standalone** | Sin NgModules en código nuevo |
| **OnPush** | `ChangeDetectionStrategy.OnPush` en todo componente |
| **Signals** | Estado local con `signal()`, derivados con `computed()` |
| **inject()** | Inyección de dependencias sin constructor |
| **Cleanup** | `takeUntilDestroyed()` para subscripciones |
| **Lazy loading** | Todas las rutas de feature con `loadComponent`/`loadChildren` |
| **Sin lógica en templates** | Lógica de negocio en servicios |
| **trackBy / track** | Siempre en listas iteradas |

## Component Pattern

```typescript
@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserCardComponent {
  user      = input.required<User>();
  fullName  = computed(() => `${this.user().firstName} ${this.user().lastName}`);
  isExpanded = signal(false);
}
```

## Signals vs RxJS

| Usar signals | Usar RxJS |
|---|---|
| Estado local del componente | Streams de datos HTTP |
| Valores derivados simples | Combinación de múltiples fuentes |
| Reemplazo de `@Input()` | Debounce, retry, cancelación |

## Control Flow (Angular 17+)

```html
@if (users().length > 0) {
  @for (user of users(); track user.id) {
    <app-user-card [user]="user" />
  }
} @else {
  <p>Sin usuarios</p>
}
```

## Instalación rápida

1. Descargá el `SKILL.md` con el botón de arriba
2. Guardalo en `~/.claude/skills/angular/SKILL.md`

## Nivel de aplicación

**Tipo:** Automático por inferencia | **Nivel:** Avanzado
