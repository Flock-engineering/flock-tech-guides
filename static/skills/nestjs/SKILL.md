---
name: nestjs
description: >
  Patrones de desarrollo con NestJS 11.
  Trigger: crear módulos, controllers, services, guards, decorators, pipes
license: MIT
metadata:
  author: tu-proyecto
  version: '1.0'
  scope: [root]
  auto_invoke:
    - 'Crear módulo NestJS'
    - 'Crear controller'
    - 'Crear service'
    - 'Crear guard'
    - 'Crear decorator'
    - 'Crear pipe'
    - 'Crear interceptor'
allowed-tools: Read, Edit, Write, Glob, Grep, Bash
---

# NestJS Skill

## Critical Rules

### ALWAYS

- Usar decoradores de clase (`@Injectable()`, `@Controller()`, etc.)
- Inyectar dependencias via constructor
- Exportar services en el módulo si se usan externamente
- Usar `@Module()` para registrar controllers, providers, imports, exports
- Nombrar archivos: `{feature}.{type}.ts` (ej: `events.controller.ts`)

### NEVER

- Instanciar services manualmente (usar DI)
- Importar módulos sin registrarlos en `imports`
- Usar lógica de negocio en controllers (mover a services)
- Olvidar `@Injectable()` en services

---

## Module Structure

```typescript
// {feature}.module.ts
import { Module } from '@nestjs/common';
import { FeatureController } from './feature.controller';
import { FeatureService } from './feature.service';

@Module({
  imports: [], // Otros módulos necesarios
  controllers: [FeatureController],
  providers: [FeatureService],
  exports: [FeatureService], // Si se usa en otros módulos
})
export class FeatureModule {}
```

---

## Controller Pattern

```typescript
// {feature}.controller.ts
import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FeatureService } from './feature.service';
import { CreateFeatureDto } from './dto/create-feature.dto';

@ApiTags('features')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('features')
export class FeatureController {
  constructor(private readonly featureService: FeatureService) {}

  @Get()
  @ApiOperation({ summary: 'Listar features' })
  findAll() {
    return this.featureService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener feature por ID' })
  findOne(@Param('id') id: string) {
    return this.featureService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear feature' })
  create(@Body() createFeatureDto: CreateFeatureDto) {
    return this.featureService.create(createFeatureDto);
  }
}
```

---

## Service Pattern

```typescript
// {feature}.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFeatureDto } from './dto/create-feature.dto';

@Injectable()
export class FeatureService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.feature.findMany({
      where: { isActive: true },
    });
  }

  async findOne(id: string) {
    const feature = await this.prisma.feature.findUnique({
      where: { id },
    });

    if (!feature || !feature.isActive) {
      throw new NotFoundException(`Feature with ID ${id} not found`);
    }

    return feature;
  }

  async create(dto: CreateFeatureDto) {
    return this.prisma.feature.create({
      data: dto,
    });
  }
}
```

---

## Guard Pattern

```typescript
// {feature}.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class FeatureGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    // Lógica de validación
    return true;
  }
}
```

---

## Custom Decorator Pattern

```typescript
// decorators/{decorator-name}.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
```

---

## Commands

```bash
# Generar módulo
nest g module {name}

# Generar controller
nest g controller {name}

# Generar service
nest g service {name}

# Generar recurso completo (module + controller + service + dto)
nest g resource {name}
```

---

## Project-Specific Notes

Adaptá esta sección a las convenciones de tu proyecto:

- Todos los módulos se registran en `src/app.module.ts`
- Usar el servicio de DB del proyecto (ej: `PrismaService`, `TypeOrmService`)
- Definir guards de autenticación del proyecto (ej: `JwtAuthGuard`)
- Definir decorators de roles según la lógica de negocio (ej: `@Roles('ADMIN', 'USER')`)
