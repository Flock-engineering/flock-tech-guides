---
id: typescript-skill
title: "Claude Skill: TypeScript estricto"
sidebar_label: "TypeScript Skill"
---

# Claude Skill: TypeScript estricto

Skill que guía a Claude para escribir código TypeScript con tipado fuerte: DTOs con validación, interfaces, tipos utilitarios y configuración estricta.

:::tip Descarga el skill
<a href="/flock-tech-guides/skills/typescript/SKILL.md" download="SKILL.md">⬇ Descargar SKILL.md</a> — guardalo en `~/.claude/skills/typescript/SKILL.md` para instalarlo directamente.
:::

## ¿Qué hace?

Cuando Claude escribe tipos o DTOs, este skill le indica:

- Patrón de **DTOs** con `class-validator` y `@ApiProperty` para Swagger
- Uso de `PartialType` para DTOs de actualización sin repetir campos
- Cómo definir **interfaces** y **tipos** utilitarios
- Decorators de validación más usados del proyecto
- Configuración de `tsconfig.json` (strict mode, paths, decorators)

## ¿Cuándo se activa?

Claude lo invoca automáticamente al detectar:

> *"Crear interface"*, *"Crear tipo"*, *"Crear DTO"*, *"Refactorizar tipado"*, *"Agregar tipos"*

## Decorators de validación más usados

| Decorator | Validación |
|---|---|
| `@IsString()` | Debe ser string |
| `@IsEmail()` | Debe ser email válido |
| `@IsNotEmpty()` | No puede estar vacío |
| `@IsOptional()` | Campo opcional |
| `@IsEnum(Enum)` | Debe ser valor del enum |
| `@IsNumber()` | Debe ser número |
| `@IsBoolean()` | Debe ser boolean |
| `@MinLength(n)` | Mínimo N caracteres |

## Patrón DTO

```typescript
export class CreateProductDto {
  @ApiProperty({ example: 'Notebook Pro' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

// Update DTO reutiliza CreateProductDto sin repetir campos
export class UpdateProductDto extends PartialType(CreateProductDto) {}
```

## Instalación rápida

1. Descargá el `SKILL.md` con el botón de arriba
2. Abrí Claude Code en tu terminal
3. Adjuntá el archivo y enviá:

> *"Instalá este skill en `~/.claude/skills/typescript/SKILL.md`"*

## Nivel de aplicación

**Tipo:** Automático por inferencia | **Nivel:** Básico
