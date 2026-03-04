---
name: typescript
description: >
  TypeScript estricto con tipado fuerte.
  Trigger: crear interfaces, tipos, DTOs, refactorizar tipado
license: MIT
metadata:
  author: tu-proyecto
  version: '1.0'
  scope: [root]
  auto_invoke:
    - 'Crear interface'
    - 'Crear tipo'
    - 'Crear DTO'
    - 'Refactorizar tipado'
    - 'Agregar tipos'
allowed-tools: Read, Edit, Write, Glob, Grep
---

# TypeScript Skill

## Critical Rules

### ALWAYS

- Tipar explícitamente parámetros de funciones
- Tipar retornos de funciones públicas
- Usar `class-validator` decoradores en DTOs
- Usar `class-transformer` para transformaciones
- Nombrar DTOs: `{action}-{entity}.dto.ts`

### NEVER

- Usar `any` sin justificación documentada
- Dejar variables sin tipo cuando no es inferible
- Usar `as` para forzar tipos (preferir type guards)
- Omitir validación en DTOs expuestos a usuarios

---

## DTO Pattern

```typescript
// dto/create-{entity}.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsInt,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEntityDto {
  @ApiProperty({ description: 'Nombre del entity', example: 'Mi Entity' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Descripción opcional' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Email de contacto',
    example: 'test@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Cantidad', minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;
}
```

---

## Update DTO Pattern (Partial)

```typescript
// dto/update-{entity}.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateEntityDto } from './create-entity.dto';

export class UpdateEntityDto extends PartialType(CreateEntityDto) {}
```

---

## Interface Pattern

```typescript
// interfaces/{entity}.interface.ts
export interface Entity {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EntityWithRelations extends Entity {
  user: User;
  items: Item[];
}
```

---

## Type Pattern

```typescript
// types/{feature}.types.ts
export type EntityStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING';

export type CreateEntityInput = Omit<Entity, 'id' | 'createdAt' | 'updatedAt'>;

export type EntityResponse = Pick<Entity, 'id' | 'name' | 'status'>;
```

---

## Common Validators

```typescript
// Strings
@IsString()
@IsNotEmpty()
@MinLength(3)
@MaxLength(100)

// Numbers
@IsInt()
@IsNumber()
@Min(0)
@Max(1000)

// Email
@IsEmail()

// UUID
@IsUUID()

// Enum
@IsEnum(MyEnum)

// Array
@IsArray()
@ArrayMinSize(1)

// Nested
@ValidateNested()
@Type(() => NestedDto)

// Optional
@IsOptional()

// Date
@IsDateString()
@IsISO8601()
```

---

## Swagger Decorators

```typescript
// Required field
@ApiProperty({
  description: 'Descripción del campo',
  example: 'valor de ejemplo',
})

// Optional field
@ApiPropertyOptional({
  description: 'Campo opcional',
  example: 'valor opcional',
})

// Enum field
@ApiProperty({
  enum: MyEnum,
  enumName: 'MyEnum',
})

// Array field
@ApiProperty({
  type: [ItemDto],
  description: 'Lista de items',
})
```

---

## Commands

```bash
# Verificar tipado sin compilar
npx tsc --noEmit

# Compilar el proyecto
npm run build

# Linting con ESLint
npm run lint

# Linting con auto-fix
npm run lint -- --fix
```

---

## Project Config

El proyecto usa:

- `tsconfig.json` con `strict: true`
- ES2023 target
- Path aliases: `@/*` → `src/*` (si configurado)
- Decorators habilitados (`experimentalDecorators: true`, `emitDecoratorMetadata: true`)
