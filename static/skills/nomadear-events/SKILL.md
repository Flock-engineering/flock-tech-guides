---
name: nomadear-events
description: >
  Sistema de eventos con modificaciones y estados para Nomadear.
  Trigger: crear eventos, modificar eventos, reschedule, suspend, historial de cambios
license: MIT
metadata:
  author: nomadear
  version: '1.0'
  scope: [root, events]
  auto_invoke:
    - 'Crear evento'
    - 'Modificar evento'
    - 'Reprogramar evento'
    - 'Suspender evento'
    - 'Cancelar evento'
    - 'Ver historial de evento'
    - 'Trabajar con estados de evento'
allowed-tools: Read, Edit, Write, Glob, Grep, Bash
---

# Nomadear Events Skill

## Critical Rules

### ALWAYS

- Registrar cambios en `EventModification` para auditoría
- Validar capacidad disponible antes de aprobar registros
- Usar soft delete (`isActive = false`) en lugar de DELETE
- Incluir `reason` y `justification` en cambios de estado
- Calcular `availableSlots` en responses

### NEVER

- Eliminar eventos físicamente de la base de datos
- Modificar eventos sin registrar en EventModification
- Permitir inscripciones a eventos SUSPENDED o CANCELLED
- Cambiar estado sin justificación

---

## Estados de Evento

```typescript
enum EventStatus {
  ACTIVE = 'ACTIVE', // Evento activo, acepta inscripciones
  SUSPENDED = 'SUSPENDED', // Temporalmente suspendido
  CANCELLED = 'CANCELLED', // Cancelado permanentemente
}
```

### Transiciones Permitidas

```
ACTIVE → SUSPENDED (con justificación)
ACTIVE → CANCELLED (con justificación)
SUSPENDED → ACTIVE (restaurar)
SUSPENDED → CANCELLED
```

---

## Acciones de Modificación

```typescript
enum EventAction {
  EDITED = 'EDITED', // Cambios en título, descripción, etc.
  RESCHEDULED = 'RESCHEDULED', // Cambio de fecha/hora
  SUSPENDED = 'SUSPENDED', // Suspensión temporal
  RESTORED = 'RESTORED', // Restauración de suspensión
  CANCELLED = 'CANCELLED', // Cancelación definitiva
}
```

---

## Crear Evento

```typescript
// POST /events (ADMIN o ASESOR)
// Body:
{
  title: 'Nombre del Evento',
  description: 'Descripción opcional',
  date: '2024-12-25',
  time: '10:00',         // formato HH:mm
  location: 'Dirección del evento',
  capacity: 100,          // mínimo 1
  dealershipId: 'uuid'   // ADMIN puede especificarlo; ASESOR usa su propia dealership
}
```

---

## Modificar Evento (Edición Simple)

```typescript
// PATCH /events/:id (Solo ADMIN)
// Body: (todos opcionales)
{
  title: 'Nuevo Título',
  description: 'Nueva descripción',
  location: 'Nueva ubicación',
  capacity: 150
  // NOTA: NO se puede cambiar fecha/hora aquí → usar /reschedule
}

// Registra EventModification con:
// - action: 'EDITED'
// - changes: { before: {...}, after: {...} }
```

---

## Reprogramar Evento

```typescript
// PATCH /events/:id/reschedule (ADMIN o ASESOR creador del evento)
// Body:
{
  date: '2024-12-30',
  time: '15:00',
  reason: 'Motivo del cambio de fecha'  // obligatorio
}

// Registra EventModification con:
// - action: 'RESCHEDULED'
// - reason: 'Motivo del cambio de fecha'
// - changes: { before: { date, time }, after: { date, time } }
```

---

## Suspender Evento

```typescript
// PATCH /events/:id/suspend (ADMIN o ASESOR creador del evento)
// Body:
{
  justification: 'Razón de la suspensión',  // obligatorio
  reason: 'Detalle adicional (opcional)'
}

// Cambia status: ACTIVE → SUSPENDED
// Efectos:
// - El evento deja de ser visible para ASESOR en GET /events
// - Bloquea modificaciones a EventRegistration (no se puede rechazar)
// Registra EventModification con:
// - action: 'SUSPENDED'
// - justification: '...'
// - reason: '...'
```

---

## Restaurar Evento

```typescript
// PATCH /events/:id/restore (Solo ADMIN)
// Body: {} (vacío)

// Cambia isActive: false → true, status puede quedar en ACTIVE
// Registra EventModification con:
// - action: 'RESTORED'
```

---

## Soft Delete / Cancelar Evento

```typescript
// DELETE /events/:id (Solo ADMIN)

// Cambia isActive → false
// Registra EventModification con:
// - action: 'CANCELLED'
// NOTA: No es DELETE físico. Recuperable con PATCH /events/:id/restore
```

---

## Reschedule restaura estado ACTIVE

```typescript
// Si el evento estaba SUSPENDED, un reschedule lo vuelve a ACTIVE
// PATCH /events/:id/reschedule → status = ACTIVE (automático)
```

---

## Ver Historial de Modificaciones

```typescript
// GET /events/:id/history
// Response:
[
  {
    id: 'mod-uuid',
    action: 'RESCHEDULED',
    modifiedBy: { id: 'user-uuid', email: 'admin@email.com' },
    reason: 'Cambio por clima',
    changes: {
      before: { date: '2024-12-25', time: '10:00' },
      after: { date: '2024-12-30', time: '15:00' },
    },
    createdAt: '2024-12-20T10:00:00Z',
  },
  // ... más modificaciones
];
```

---

## Calcular Cupos Disponibles

```typescript
// En el service
async getEventWithAvailability(id: string) {
  const event = await this.prisma.event.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          eventRegistrations: {
            where: { status: 'APPROVED' },
          },
        },
      },
    },
  });

  const approvedCount = event._count.eventRegistrations;
  const availableSlots = event.capacity - approvedCount;

  return {
    ...event,
    approvedRegistrations: approvedCount,
    availableSlots,
  };
}
```

---

## Archivos Clave

- `src/events/events.controller.ts` - Endpoints protegidos
- `src/events/public-events.controller.ts` - Endpoints públicos
- `src/events/events.service.ts` - Lógica de negocio
- `src/events/dto/` - DTOs (create, update, reschedule, suspend)

---

## Modelo Prisma

```prisma
model Event {
  id            String        @id @default(uuid())
  title         String
  description   String?
  date          DateTime
  time          String
  location      String
  capacity      Int
  status        EventStatus   @default(ACTIVE)
  isActive      Boolean       @default(true)
  dealershipId  String?
  createdById   String
  // ... relaciones
}

model EventModification {
  id           String      @id @default(uuid())
  eventId      String
  action       EventAction
  modifiedById String
  reason       String?
  justification String?
  changes      Json?
  createdAt    DateTime    @default(now())
}
```
