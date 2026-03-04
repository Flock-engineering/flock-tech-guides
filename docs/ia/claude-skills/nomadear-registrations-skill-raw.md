---
id: nomadear-registrations-skill-raw
title: "SKILL.md — Nomadear Registrations"
sidebar_label: "SKILL.md"
---

# SKILL.md — Nomadear Registrations

Archivo de instrucciones que Claude usa internamente. Si encontrás algo para mejorar, abrí un PR directamente.

:::info Contribuir
[✏️ Sugerir corrección en GitHub](https://github.com/Flock-engineering/flock-tech-guides/edit/dev/static/skills/nomadear-registrations/SKILL.md) — GitHub te propone hacer fork y PR automáticamente si no tenés permisos de push.
:::

[⬇ Descargar SKILL.md](pathname:///flock-tech-guides/skills/nomadear-registrations/SKILL.md)

---

````md
---
name: nomadear-registrations
description: >
  Sistema de preinscripciones públicas con bulk upload para Nomadear.
  Trigger: crear preinscripción, aprobar/rechazar, bulk upload CSV, validar duplicados
license: MIT
metadata:
  author: nomadear
  version: '1.0'
  scope: [root]
  auto_invoke:
    - 'Crear preinscripción'
    - 'Aprobar preinscripción'
    - 'Rechazar preinscripción'
    - 'Bulk upload CSV'
    - 'Validar duplicados'
    - 'Trabajar con registros de eventos'
allowed-tools: Read, Edit, Write, Glob, Grep, Bash
---

# Nomadear Registrations Skill

## Critical Rules

### ALWAYS

- Validar duplicados por `email + eventId` y `dni + eventId`
- Verificar capacidad disponible antes de aprobar
- Registrar `origin` (WEB, CSV, MANUAL) en cada registro
- Incluir reporte detallado en bulk uploads

### NEVER

- Aprobar registros si el evento está SUSPENDED o CANCELLED
- Permitir duplicados de email o DNI para el mismo evento
- Aprobar más registros que la capacidad disponible
- Perder datos en bulk upload (siempre reportar errores)

---

## Estados de Registro

```typescript
enum RegisterStatus {
  PENDING = 'PENDING', // Esperando aprobación
  APPROVED = 'APPROVED', // Aprobado, cuenta para cupos
  REJECTED = 'REJECTED', // Rechazado
}
```

---

## Preinscripción Pública (Auto-Aprobada)

```typescript
// POST /event-registrations/public/:eventId (Sin auth)
// Body:
{
  firstName: 'Juan',
  lastName: 'Pérez',
  email: 'juan@email.com',
  dni: '12345678',
  carBrand: 'Fiat',
  carModel: 'Cronos',
  carPlate: 'ABC123'
}

// Se crea con:
// - status: APPROVED (automático, NO queda PENDING)
// - origin: 'public'
// Validaciones previas:
// - Evento activo con fecha futura
// - Cupos disponibles (capacity - APPROVED count)
// - email único por evento
// - dni único por evento
```

---

## Rechazar Registro

```typescript
// PATCH /event-registrations/:id/reject (JWT, ADMIN o ASESOR)
// Body: {} (vacío)
// Restricción: NO se puede rechazar si el evento está SUSPENDED

// Resultado:
// - status: APPROVED → REJECTED
// - rejectedBy: userId del que rechaza
// - rejectedAt: timestamp actual
```

---

## Bulk Upload CSV

```typescript
// POST /event-registrations/event/:eventId/bulk (JWT, ADMIN o ASESOR)
// Content-Type: multipart/form-data (campo: file)
// NOTA: La ruta es /event/:eventId/bulk (no /bulk/:eventId)

// Formato CSV requerido (headers exactos):
// firstName,lastName,email,dni,carBrand,carModel,carPlate

// Se crea cada fila con:
// - status: APPROVED (automático)
// - origin: 'csv'
// - createdBy: userId del que sube

// Response:
{
  total: 100,
  created: 85,
  skipped: 10,
  errors: [
    { row: 5, email: 'existing@email.com', reason: 'Email ya registrado' },
    { row: 12, reason: 'DNI inválido' }
  ]
}
```

---

## Validación de Duplicados

```typescript
async validateDuplicates(eventId: string, email: string, dni: string) {
  // Check email duplicado
  const emailExists = await this.prisma.eventRegistration.findFirst({
    where: { eventId, email },
  });
  if (emailExists) {
    throw new ConflictException('Email ya registrado para este evento');
  }

  // Check DNI duplicado
  const dniExists = await this.prisma.eventRegistration.findFirst({
    where: { eventId, dni },
  });
  if (dniExists) {
    throw new ConflictException('DNI ya registrado para este evento');
  }
}
```

---

## Validación de Capacidad

```typescript
async checkCapacity(eventId: string) {
  const event = await this.prisma.event.findUnique({
    where: { id: eventId },
    include: {
      _count: {
        select: {
          eventRegistrations: { where: { status: 'APPROVED' } },
        },
      },
    },
  });

  const approvedCount = event._count.eventRegistrations;
  const availableSlots = event.capacity - approvedCount;

  if (availableSlots <= 0) {
    throw new BadRequestException('No hay cupos disponibles');
  }

  return availableSlots;
}
```

---

## Listar Registros de un Evento

```typescript
// GET /event-registrations/event/:eventId (JWT, ADMIN o ASESOR)
// Response: array directo (sin paginación)
[
  {
    id: 'reg-uuid',
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan@email.com',
    dni: '12345678',
    carBrand: 'Fiat',
    carModel: 'Cronos',
    carPlate: 'ABC123',
    status: 'APPROVED',
    origin: 'public',
    createdBy: null,
    rejectedBy: null,
    rejectedAt: null,
    createdAt: '2024-12-20T10:00:00Z',
  },
]
```

---

## EventAttendees (Inscripciones Internas)

Son distintos a EventRegistrations. Los EventAttendees son usuarios del sistema que se inscriben.

```typescript
// POST /event-attendees (JWT, cualquier rol)
{
  eventId: 'uuid';
}

// GET /event-attendees/my-registrations (JWT)
// → inscripciones propias del usuario autenticado

// GET /event-attendees/event/:eventId (JWT, ADMIN o ASESOR)
// → lista de attendees del evento

// DELETE /event-attendees/:eventId (JWT)
// → cancela inscripción (DELETE FÍSICO, no soft delete)
```

---

## Modelo Prisma

```prisma
model EventRegistration {
  id          String          @id @default(uuid())
  firstName   String
  lastName    String
  email       String
  dni         String
  carBrand    String
  carModel    String
  carPlate    String
  status      RegisterStatus  @default(PENDING)
  origin      String          @default("WEB")

  eventId     String
  event       Event           @relation(fields: [eventId], references: [id])

  createdBy   String?
  rejectedBy  String?
  rejectedAt  DateTime?

  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt

  @@unique([email, eventId])
  @@unique([dni, eventId])
  @@index([eventId])
  @@index([status])
}
```

---

## Archivos Clave

- `src/event-registrations/event-registrations.controller.ts`
- `src/event-registrations/event-registrations.service.ts`
- `src/event-registrations/dto/create-event-registration.dto.ts`
- `src/event-registrations/dto/bulk-upload.dto.ts`
````
