---
id: typescript-skill
title: "Claude Skill: TypeScript estricto"
sidebar_label: "TypeScript Skill"
---

# Claude Skill: TypeScript estricto

Skill que guía a Claude para escribir código TypeScript con tipado fuerte, **calidad de código** y sin duplicación — aplicando utility types, generics, type guards y buenas prácticas de organización de tipos.

:::tip Descarga el skill
<a href="/flock-tech-guides/skills/typescript/SKILL.md" download="SKILL.md">⬇ Descargar SKILL.md</a> — guardalo en `~/.claude/skills/typescript/SKILL.md` para instalarlo directamente.
:::

## ¿Qué hace?

Cuando Claude escribe tipos, DTOs o refactoriza código TypeScript, este skill le indica:

- Patrón de **DTOs** con `class-validator` y `@ApiProperty` para Swagger
- Uso de `PartialType` para DTOs de actualización sin repetir campos
- **Utility types** (`Pick`, `Omit`, `Record`, `ReturnType`) para evitar duplicar definiciones
- **Generics** para respuestas paginadas, results y repositorios reutilizables
- **Type guards** (`value is T`) para narrowing seguro en vez de casteos con `as`
- **Error typing** con `catch (error: unknown)` y type guards
- **Barrel exports** para centralizar tipos compartidos
- Reglas de ESLint recomendadas para calidad de código

## ¿Cuándo se activa?

Claude lo invoca automáticamente al detectar:

> *"Crear interface"*, *"Crear tipo"*, *"Crear DTO"*, *"Refactorizar tipado"*, *"Agregar tipos"*, *"Evitar duplicación de tipos"*, *"Mejorar calidad de código TypeScript"*

## Reglas de calidad

| Regla | Descripción |
|---|---|
| **Sin `any`** | Usar tipos específicos o `unknown` + narrowing |
| **Sin `as`** | Usar type guards explícitos |
| **Sin tipos duplicados** | Derivar con `Pick`, `Omit`, `Partial` |
| **Sin `object` o `{}`** | Usar `Record<string, unknown>` o interfaz |
| **Sin `Function`** | Usar firma: `(arg: Type) => ReturnType` |
| **Sin mutar params** | Las funciones no deben modificar sus argumentos |
| **`catch (error: unknown)`** | Siempre, nunca `catch (e: any)` |
| **`readonly` donde aplique** | Propiedades que no deben cambiar |

## Anti-duplicación con Utility Types

En lugar de copiar y pegar definiciones:

```typescript
// ❌ MAL — redefine campos que ya existen en User
type UserResponse = { id: string; name: string; email: string };

// ✅ BIEN — deriva del tipo base
type UserResponse = Pick<User, 'id' | 'name' | 'email'>;
type UserInput    = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
type RoleMap      = Record<UserRole, string[]>;
```

## Generics reutilizables

```typescript
// Una sola definición — usada en todos los módulos
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

type UserList  = PaginatedResponse<User>;
type EventList = PaginatedResponse<Event>;
```

## Type Guards en vez de `as`

```typescript
// ❌ MAL
const user = response as User;

// ✅ BIEN
function isUser(value: unknown): value is User {
  return typeof value === 'object' && value !== null && 'id' in value;
}
```

## Error Typing

```typescript
// ❌ MAL
} catch (e: any) { console.error(e.message); }

// ✅ BIEN
} catch (error: unknown) {
  if (isAppError(error)) throw error;
  throw new AppError('Error inesperado', 'UNKNOWN');
}
```

## Decorators de validación más usados

| Decorator | Validación |
|---|---|
| `@IsString()` | Debe ser string |
| `@IsEmail()` | Debe ser email válido |
| `@IsNotEmpty()` | No puede estar vacío |
| `@IsOptional()` | Campo opcional |
| `@IsEnum(Enum)` | Debe ser valor del enum |
| `@IsUUID()` | Debe ser UUID válido |
| `@MinLength(n)` | Mínimo N caracteres |
| `@ValidateNested()` | Validar objetos anidados |

## Instalación rápida

1. Descargá el `SKILL.md` con el botón de arriba
2. Abrí Claude Code en tu terminal
3. Adjuntá el archivo y enviá:

> *"Instalá este skill en `~/.claude/skills/typescript/SKILL.md`"*

## Nivel de aplicación

**Tipo:** Automático por inferencia | **Nivel:** Avanzado
