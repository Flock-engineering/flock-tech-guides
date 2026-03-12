---
name: react
description: >
  React moderno con hooks, TypeScript estricto, rendimiento y calidad de código.
  Trigger: crear componente React, crear hook personalizado, refactorizar React, context React, optimizar React
license: MIT
metadata:
  author: flock-engineering
  version: '1.0'
  scope: [root]
  auto_invoke:
    - 'Crear componente React'
    - 'Crear hook personalizado'
    - 'Refactorizar React'
    - 'Context React'
    - 'Optimizar rendimiento React'
    - 'Agregar estado React'
allowed-tools: Read, Edit, Write, Glob, Grep
---

# React Skill

## Critical Rules

### ALWAYS

- Usar **componentes funcionales** — nunca class components en código nuevo
- Tipar todos los props con `interface` o `type` + TypeScript strict
- Usar `React.FC` solo si se necesita `children` tipado; preferir tipar props directamente
- Envolver callbacks en `useCallback` cuando se pasan como props a componentes memorizados
- Usar `useMemo` para cálculos costosos o derivaciones de listas
- Aplicar `React.memo()` a componentes que reciben las mismas props frecuentemente
- Limpiar efectos en `useEffect` — retornar cleanup function cuando sea necesario
- Extraer lógica compleja a **custom hooks** (`use` prefix)
- Manejar estados de loading/error explícitamente en cada fetch
- Usar `key` única y estable en listas — nunca índice como key si la lista puede reordenarse

### NEVER

- Mutar estado directamente — siempre usar el setter de `useState`
- Llamar hooks condicionalmente o dentro de loops
- Usar `any` en props, state o retornos de hooks
- Hacer fetch dentro de `useEffect` sin manejo de cleanup o AbortController
- Definir componentes dentro de otros componentes (recrea en cada render)
- Acceder a `ref.current` durante el render (solo en efectos/handlers)
- Propagar tipos `any` desde librerías — crear tipos wrapper

---

## Component Pattern

```tsx
// components/UserCard/UserCard.tsx
import { memo, useCallback } from 'react';
import type { User } from '@/types/user.types';

interface UserCardProps {
  user: User;
  onDelete: (id: string) => void;
  isSelected?: boolean;
}

export const UserCard = memo(function UserCard({
  user,
  onDelete,
  isSelected = false,
}: UserCardProps) {
  const handleDelete = useCallback(() => {
    onDelete(user.id);
  }, [onDelete, user.id]);

  return (
    <article className={`card ${isSelected ? 'card--selected' : ''}`}>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      <button type="button" onClick={handleDelete}>
        Eliminar
      </button>
    </article>
  );
});
```

---

## Custom Hook Pattern

```tsx
// hooks/useUsers.ts
import { useState, useEffect, useCallback } from 'react';
import type { User } from '@/types/user.types';
import { userService } from '@/services/user.service';

interface UseUsersReturn {
  users: User[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useUsers(): UseUsersReturn {
  const [users, setUsers]       = useState<User[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await userService.getAll();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, isLoading, error, refetch: fetchUsers };
}
```

---

## Fetch con AbortController (cleanup correcto)

```tsx
// hooks/useUserDetail.ts
import { useState, useEffect } from 'react';
import type { User } from '@/types/user.types';

export function useUserDetail(id: string) {
  const [user, setUser]         = useState<User | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchUser() {
      setLoading(true);
      try {
        const res = await fetch(`/api/users/${id}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: User = await res.json();
        setUser(data);
      } catch (err) {
        if ((err as Error).name === 'AbortError') return; // ignorar cancel
        setError(err instanceof Error ? err.message : 'Error');
      } finally {
        setLoading(false);
      }
    }

    fetchUser();

    // Cleanup: cancela el fetch si el componente se desmonta o id cambia
    return () => controller.abort();
  }, [id]);

  return { user, isLoading, error };
}
```

---

## Context Pattern (con hook de acceso)

```tsx
// context/auth.context.tsx
import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { User } from '@/types/user.types';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback((token: string, userData: User) => {
    localStorage.setItem('token', token);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook de acceso — lanza error si se usa fuera del Provider
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
```

---

## useMemo y useCallback — Cuándo Usar

```tsx
// ✅ useMemo: cálculo derivado costoso
const sortedUsers = useMemo(
  () => [...users].sort((a, b) => a.name.localeCompare(b.name)),
  [users],
);

// ✅ useMemo: objeto/array que se pasa a componente memorizado
const tableConfig = useMemo(
  () => ({ columns, sortable: true, pageSize: 20 }),
  [columns],
);

// ✅ useCallback: función que se pasa como prop a componente con memo
const handleDelete = useCallback(
  (id: string) => userService.delete(id).then(refetch),
  [refetch],
);

// ❌ NO usar memo/callback cuando:
// - El cálculo es trivial (suma de 2 números)
// - El componente hijo no usa React.memo
// - La dependencia cambia en cada render de todas formas
```

---

## Tipado de Eventos

```tsx
// Eventos HTML tipados correctamente
const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
  setValue(e.target.value);
};

const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
  e.preventDefault();
  // ...
};

const handleClick = (e: React.MouseEvent<HTMLButtonElement>): void => {
  e.stopPropagation();
};

const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
  if (e.key === 'Enter') onSubmit();
};
```

---

## Error Boundary

```tsx
// components/ErrorBoundary/ErrorBoundary.tsx
import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('ErrorBoundary:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <p>Algo salió mal.</p>;
    }
    return this.props.children;
  }
}
```

---

## Commands

```bash
# Crear proyecto con Vite + React + TypeScript
npm create vite@latest my-app -- --template react-ts

# Instalar dependencias de calidad
npm install -D eslint @typescript-eslint/eslint-plugin eslint-plugin-react-hooks

# Tests con Vitest
npm install -D vitest @testing-library/react @testing-library/user-event

# Correr tests
npx vitest

# Verificar tipado
npx tsc --noEmit

# Build producción
npm run build
```
