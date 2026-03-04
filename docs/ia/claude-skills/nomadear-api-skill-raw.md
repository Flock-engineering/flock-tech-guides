---
id: nomadear-api-skill-raw
title: "SKILL.md — Nomadear API"
sidebar_label: "SKILL.md"
---

# SKILL.md — Nomadear API

Archivo de instrucciones que Claude usa internamente. Si encontrás algo para mejorar, abrí un PR directamente.

:::info Contribuir
[✏️ Sugerir corrección en GitHub](https://github.com/Flock-engineering/flock-tech-guides/edit/dev/static/skills/nomadear-api/SKILL.md) — GitHub te propone hacer fork y PR automáticamente si no tenés permisos de push.
:::

[⬇ Descargar SKILL.md](/flock-tech-guides/skills/nomadear-api/SKILL.md)

---

````md
---
name: nomadear-api
description: >
  Convenciones de API REST para Nomadear.
  Trigger: crear endpoint, diseñar API, estructurar responses, manejar errores
license: MIT
metadata:
  author: nomadear
  version: '1.0'
  scope: [root]
  auto_invoke:
    - 'Crear endpoint REST'
    - 'Diseñar API'
    - 'Estructurar response'
    - 'Manejar errores HTTP'
    - 'Paginar resultados'
allowed-tools: Read, Edit, Write, Glob, Grep
---

# Nomadear API Skill

## Critical Rules

### ALWAYS

- Usar verbos HTTP correctamente (GET, POST, PATCH, DELETE)
- Retornar códigos de estado apropiados
- Incluir mensajes de error descriptivos
- Documentar con Swagger
- Validar input con class-validator

### NEVER

- Usar GET para modificar datos
- Retornar 200 para errores
- Exponer detalles internos en errores de producción
- Crear endpoints sin documentación Swagger

---

## Convención de URLs

```
# Recursos principales
GET    /resources          # Listar
POST   /resources          # Crear
GET    /resources/:id      # Obtener uno
PATCH  /resources/:id      # Actualizar parcial
DELETE /resources/:id      # Eliminar (soft delete)

# Acciones específicas
PATCH  /resources/:id/action   # Acción sobre recurso
POST   /resources/:id/action   # Acción que crea algo

# Recursos públicos
GET    /public/resources       # Sin auth
POST   /public/resources/:id   # Acción pública

# Recursos anidados
GET    /resources/:id/children       # Listar hijos
POST   /resources/:id/children       # Crear hijo
```

---

## Códigos de Estado

| Código | Uso                                 |
| ------ | ----------------------------------- |
| 200    | GET exitoso, PATCH exitoso          |
| 201    | POST exitoso (recurso creado)       |
| 204    | DELETE exitoso (sin contenido)      |
| 400    | Bad Request (validación fallida)    |
| 401    | Unauthorized (sin token o inválido) |
| 403    | Forbidden (sin permisos)            |
| 404    | Not Found (recurso no existe)       |
| 409    | Conflict (duplicado, constraint)    |
| 500    | Internal Server Error               |

---

## Estructura de Responses

### Éxito - Item Único

```json
{
  "id": "uuid",
  "name": "Recurso",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### Éxito - Lista (Endpoints Públicos)

Los endpoints públicos retornan arrays directos sin paginación, ya que el volumen de datos es limitado:

```json
[
  { "id": "uuid-1", "name": "Item 1" },
  { "id": "uuid-2", "name": "Item 2" }
]
```

### Éxito - Lista Paginada (Endpoints Protegidos/Admin)

Para endpoints administrativos con alto volumen de datos, usar estructura paginada:

```json
{
  "data": [
    { "id": "uuid-1", "name": "Item 1" },
    { "id": "uuid-2", "name": "Item 2" }
  ],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

### Error

```json
{
  "statusCode": 400,
  "message": "Descripción del error",
  "error": "Bad Request"
}
```

---

## Paginación

### Cuándo NO paginar

- Endpoints públicos (`/public/*`)
- Listados con volumen limitado (eventos futuros, concesionarias)
- Datos que el frontend necesita completos (calendarios, selectores)

### Cuándo SÍ paginar

- Endpoints administrativos con alto volumen
- Historial de registros
- Búsquedas que pueden retornar muchos resultados

### Implementación (cuando aplique)

```typescript
@Get()
@ApiQuery({ name: 'page', required: false, type: Number })
@ApiQuery({ name: 'limit', required: false, type: Number })
async findAll(
  @Query('page') page = 1,
  @Query('limit') limit = 20,
) {
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    this.prisma.resource.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    this.prisma.resource.count(),
  ]);

  return { data, total, page, limit };
}
```

---

## Manejo de Errores

```typescript
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';

// No encontrado
throw new NotFoundException(`Resource with ID ${id} not found`);

// Validación de negocio
throw new BadRequestException('No hay cupos disponibles');

// Duplicado
throw new ConflictException('Email ya registrado');

// Sin permisos
throw new ForbiddenException('No tiene permisos para esta acción');
```

---

## Endpoints del Proyecto

### Auth

```
POST /auth/login              # Login → { access_token, user }
POST /auth/register           # Crear usuario (validación interna por rol)
GET  /profile                 # Perfil del usuario autenticado (JWT)
```

### Users (JWT + ADMIN)

```
GET    /users                 # Listar usuarios activos
GET    /users/inactive        # Listar usuarios inactivos
DELETE /users/:id             # Soft delete (isActive = false)
PATCH  /users/:id/restore     # Reactivar usuario
```

### Events (JWT + ADMIN o ASESOR)

```
POST   /events                    # Crear (ADMIN o ASESOR)
GET    /events                    # Listar activos
GET    /events/inactive/all       # Listar inactivos
GET    /events/:id                # Detalle
PATCH  /events/:id                # Editar (solo ADMIN)
DELETE /events/:id                # Soft delete (solo ADMIN)
PATCH  /events/:id/restore        # Reactivar (solo ADMIN)
PATCH  /events/:id/reschedule     # Reprogramar + reason
PATCH  /events/:id/suspend        # Suspender + justification
GET    /events/:id/history        # Historial de modificaciones
```

### Public Events (sin auth)

```
GET /public/events           # Eventos activos, futuros, status=ACTIVE
GET /public/events/upcoming  # Listar eventos desde hoy (00:00)
GET /public/events/:id       # Detalle con dealership completo
```

### Event Registrations

```
POST  /event-registrations/public/:eventId          # Preinscripción pública (sin auth)
GET   /event-registrations/event/:eventId           # Listar por evento (JWT)
PATCH /event-registrations/:id/reject               # Rechazar (JWT)
POST  /event-registrations/event/:eventId/bulk      # Bulk upload CSV (JWT)
```

### Event Attendees

```
POST   /event-attendees                   # Inscribirse a evento (JWT)
GET    /event-attendees/my-registrations  # Mis inscripciones (JWT)
GET    /event-attendees/event/:eventId    # Asistentes de un evento (JWT)
DELETE /event-attendees/:eventId          # Cancelar inscripción (JWT)
```

### Register

```
POST /register    # Solicitar alta como asesor (sin auth)
```

### Dealerships

```
GET /dealerships        # Listar todas las concesionarias
GET /dealerships/:id    # Detalle de una concesionaria
```

### Bot IA

```
POST /bot/ask    # Preguntar al bot de Fiat Titano
                 # Body: { question: string (3-500 chars) }
                 # Response: { botResponse: string }
```
````
