---
id: react-skill
title: "Claude Skill: React moderno"
sidebar_label: "React Skill"
---

# Claude Skill: React moderno

Skill que guía a Claude para escribir componentes React con hooks, TypeScript estricto, rendimiento optimizado y sin anti-patrones comunes de re-renders o memory leaks.

:::tip Descarga el skill
<a href="/flock-tech-guides/skills/react/SKILL.md" download="SKILL.md">⬇ Descargar SKILL.md</a> — guardalo en `~/.claude/skills/react/SKILL.md` para instalarlo directamente.
:::

## ¿Qué hace?

Cuando Claude escribe o refactoriza componentes React, este skill le indica:

- Usar siempre **componentes funcionales** con hooks — nunca class components en código nuevo
- Tipar todos los props con `interface` o `type` + TypeScript strict
- Envolver callbacks en `useCallback` y cálculos en `useMemo` cuando corresponde
- Aplicar `React.memo()` a componentes que reciben las mismas props frecuentemente
- Limpiar efectos en `useEffect` — retornar cleanup function o usar `AbortController`
- Extraer lógica compleja a **custom hooks** con prefijo `use`
- Manejar estados de loading/error explícitamente en cada fetch
- Usar `key` única y estable en listas — nunca el índice si la lista puede reordenarse

## ¿Cuándo se activa?

Claude lo invoca automáticamente al detectar:

> *"Crear componente React"*, *"Crear hook personalizado"*, *"Refactorizar React"*, *"Context React"*, *"Optimizar rendimiento React"*, *"Agregar estado React"*

## Reglas de calidad

| Regla | Descripción |
|---|---|
| **Sin mutación de estado** | Siempre usar el setter de `useState` |
| **Sin hooks condicionales** | Nunca llamar hooks dentro de `if` o loops |
| **Sin `any` en props/state** | Tipos explícitos en todos los componentes |
| **Cleanup en `useEffect`** | Retornar función de cleanup o AbortController |
| **Sin componentes anidados** | No definir componentes dentro de otros componentes |
| **`key` estable en listas** | Nunca usar índice si la lista puede reordenarse |

## Componente memorizado con callback tipado

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
      <button type="button" onClick={handleDelete}>Eliminar</button>
    </article>
  );
});
```

## Custom hook con fetch y cleanup

```tsx
// hooks/useUsers.ts
export function useUsers() {
  const [users, setUsers]       = useState<User[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    const controller = new AbortController();
    setLoading(true);
    try {
      const data = await userService.getAll({ signal: controller.signal });
      setUsers(data);
    } catch (err) {
      if ((err as Error).name !== 'AbortError')
        setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
    return () => controller.abort();
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  return { users, isLoading, error, refetch: fetchUsers };
}
```

## Instalación rápida

1. Descargá el `SKILL.md` con el botón de arriba
2. Abrí Claude Code en tu terminal
3. Adjuntá el archivo y enviá:

> *"Instalá este skill en `~/.claude/skills/react/SKILL.md`"*

## Nivel de aplicación

**Tipo:** Automático por inferencia | **Nivel:** Avanzado
