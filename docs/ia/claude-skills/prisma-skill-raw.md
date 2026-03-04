---
id: prisma-skill-raw
title: "SKILL.md — Prisma"
sidebar_label: "SKILL.md"
---

# SKILL.md — Prisma

Archivo de instrucciones que Claude usa internamente. Si encontrás algo para mejorar, abrí un PR directamente.

:::info Contribuir
[✏️ Sugerir corrección en GitHub](https://github.com/Flock-engineering/flock-tech-guides/edit/dev/static/skills/prisma/SKILL.md) — GitHub te propone hacer fork y PR automáticamente si no tenés permisos de push.
:::

[⬇ Descargar SKILL.md](pathname:///flock-tech-guides/skills/prisma/SKILL.md)

---

````md
---
name: prisma
description: >
  ORM Prisma 7 con PostgreSQL.
  Trigger: modificar schema, crear migraciones, escribir queries, seeders
license: MIT
metadata:
  author: tu-proyecto
  version: '1.0'
  scope: [root]
  auto_invoke:
    - 'Modificar schema.prisma'
    - 'Crear migración'
    - 'Escribir query Prisma'
    - 'Crear seeder'
    - 'Agregar modelo'
    - 'Agregar relación'
allowed-tools: Read, Edit, Write, Glob, Grep, Bash
---

# Prisma Skill

## Critical Rules

### ALWAYS

- Usar `@id @default(uuid())` para IDs
- Agregar `createdAt` y `updatedAt` a todos los modelos
- Crear migraciones con nombre descriptivo
- Regenerar cliente después de cambios: `npx prisma generate`
- Usar transacciones para operaciones múltiples

### NEVER

- Modificar migraciones ya aplicadas en producción
- Usar IDs incrementales (usar UUID)
- Olvidar índices en campos de búsqueda frecuente
- Hacer queries N+1 (usar `include` o `select`)

---

## Model Pattern

```prisma
// prisma/schema.prisma
model Entity {
  id          String   @id @default(uuid())
  name        String
  description String?
  status      Status   @default(ACTIVE)
  isActive    Boolean  @default(true)

  // Relations
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  items       Item[]

  // Timestamps
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Indexes
  @@index([userId])
  @@index([status])
  @@index([isActive])
}

enum Status {
  ACTIVE
  INACTIVE
  PENDING
}
```

---

## Relation Patterns

### One-to-Many

```prisma
model User {
  id     String  @id @default(uuid())
  posts  Post[]  // One user has many posts
}

model Post {
  id       String @id @default(uuid())
  userId   String
  user     User   @relation(fields: [userId], references: [id])
}
```

### Many-to-Many

```prisma
model Post {
  id    String @id @default(uuid())
  tags  Tag[]
}

model Tag {
  id    String @id @default(uuid())
  posts Post[]
}
```

### Many-to-Many with Explicit Table

```prisma
model User {
  id          String       @id @default(uuid())
  attendances EventAttendee[]
}

model Event {
  id          String       @id @default(uuid())
  attendees   EventAttendee[]
}

model EventAttendee {
  id        String   @id @default(uuid())
  userId    String
  eventId   String
  user      User     @relation(fields: [userId], references: [id])
  event     Event    @relation(fields: [eventId], references: [id])
  createdAt DateTime @default(now())

  @@unique([userId, eventId])
}
```

---

## Query Patterns

### Find with Relations

```typescript
// Include relations
const user = await this.prisma.user.findUnique({
  where: { id },
  include: {
    posts: true,
    profile: true,
  },
});

// Select specific fields
const user = await this.prisma.user.findUnique({
  where: { id },
  select: {
    id: true,
    email: true,
    posts: {
      select: { title: true },
    },
  },
});
```

### Find Many with Filters

```typescript
const events = await this.prisma.event.findMany({
  where: {
    isActive: true,
    status: 'ACTIVE',
    date: { gte: new Date() },
    OR: [
      { title: { contains: search } },
      { description: { contains: search } },
    ],
  },
  orderBy: { date: 'asc' },
  take: 10,
  skip: 0,
});
```

### Create with Relations

```typescript
const event = await this.prisma.event.create({
  data: {
    title: 'Nuevo Evento',
    user: { connect: { id: userId } },
    dealership: { connect: { id: dealershipId } },
  },
  include: { user: true },
});
```

### Update

```typescript
const updated = await this.prisma.event.update({
  where: { id },
  data: { title: 'Nuevo Título' },
});
```

### Soft Delete

```typescript
// Soft delete (preferido en este proyecto)
await this.prisma.user.update({
  where: { id },
  data: { isActive: false },
});

// Hard delete (evitar)
await this.prisma.user.delete({
  where: { id },
});
```

### Transactions

```typescript
const [user, event] = await this.prisma.$transaction([
  this.prisma.user.create({ data: userData }),
  this.prisma.event.create({ data: eventData }),
]);

// O con callback
await this.prisma.$transaction(async (tx) => {
  const user = await tx.user.create({ data: userData });
  await tx.event.create({ data: { ...eventData, userId: user.id } });
});
```

---

## Migration Commands

```bash
# Crear migración en desarrollo
npx prisma migrate dev --name add_new_feature

# Aplicar migraciones en producción
npx prisma migrate deploy

# Regenerar cliente
npx prisma generate

# Ver estado de migraciones
npx prisma migrate status

# Reset database (desarrollo)
npx prisma migrate reset

# Ejecutar seed
npx prisma db seed
```

---

## Project Schema Location

- Schema: `prisma/schema.prisma`
- Migraciones: `prisma/migrations/`
- Seed: `prisma/seed.ts`
````
