---
name: swagger
description: >
  Documentación API con Swagger/OpenAPI.
  Trigger: documentar endpoints, agregar ejemplos, configurar auth en docs
license: MIT
metadata:
  author: tu-proyecto
  version: '1.0'
  scope: [root]
  auto_invoke:
    - 'Documentar endpoint'
    - 'Agregar ejemplos Swagger'
    - 'Configurar Swagger'
    - 'Agregar API tags'
allowed-tools: Read, Edit, Write, Glob, Grep
---

# Swagger Skill

## Critical Rules

### ALWAYS

- Agregar `@ApiTags()` a cada controller
- Documentar cada endpoint con `@ApiOperation()`
- Agregar `@ApiBearerAuth()` a endpoints protegidos
- Incluir ejemplos en `@ApiProperty()`
- Documentar responses con `@ApiResponse()`

### NEVER

- Dejar endpoints sin documentación
- Olvidar marcar campos opcionales en DTOs
- Exponer campos sensibles en ejemplos (passwords, tokens)

---

## Controller Documentation

```typescript
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('features')
@ApiBearerAuth()
@Controller('features')
export class FeatureController {
  @Get()
  @ApiOperation({ summary: 'Listar todas las features' })
  @ApiResponse({
    status: 200,
    description: 'Lista de features',
    type: [FeatureDto],
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  findAll() {}

  @Get(':id')
  @ApiOperation({ summary: 'Obtener feature por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID de la feature',
    example: 'uuid-here',
  })
  @ApiResponse({
    status: 200,
    description: 'Feature encontrada',
    type: FeatureDto,
  })
  @ApiResponse({ status: 404, description: 'Feature no encontrada' })
  findOne(@Param('id') id: string) {}

  @Post()
  @ApiOperation({ summary: 'Crear nueva feature' })
  @ApiResponse({ status: 201, description: 'Feature creada', type: FeatureDto })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  create(@Body() dto: CreateFeatureDto) {}
}
```

---

## DTO Documentation

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFeatureDto {
  @ApiProperty({
    description: 'Nombre de la feature',
    example: 'Mi Feature',
    minLength: 3,
    maxLength: 100,
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Descripción opcional',
    example: 'Una descripción detallada',
  })
  description?: string;

  @ApiProperty({
    description: 'Estado de la feature',
    enum: ['ACTIVE', 'INACTIVE'],
    example: 'ACTIVE',
  })
  status: string;

  @ApiProperty({
    description: 'Fecha del evento',
    example: '2024-12-25',
    type: String,
    format: 'date',
  })
  date: string;
}
```

---

## Response Types

```typescript
// Para responses tipadas
export class FeatureResponseDto {
  @ApiProperty({ example: 'uuid-123' })
  id: string;

  @ApiProperty({ example: 'Mi Feature' })
  name: string;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  createdAt: Date;
}

// En controller
@ApiResponse({
  status: 200,
  description: 'Operación exitosa',
  type: FeatureResponseDto,
})
```

---

## Query Parameters

```typescript
@Get()
@ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
@ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
@ApiQuery({ name: 'search', required: false, type: String })
findAll(
  @Query('page') page?: number,
  @Query('limit') limit?: number,
  @Query('search') search?: string,
) {}
```

---

## File Upload

```typescript
@Post('upload')
@ApiConsumes('multipart/form-data')
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      file: {
        type: 'string',
        format: 'binary',
      },
    },
  },
})
@UseInterceptors(FileInterceptor('file'))
uploadFile(@UploadedFile() file: Express.Multer.File) {}
```

---

## Project Swagger Config

La configuración está en `src/main.ts`:

```typescript
const config = new DocumentBuilder()
  .setTitle('Mi API')
  .setDescription('Descripción de la API del proyecto')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api', app, document);
```

**URL de documentación**: `http://localhost:3000/api`
