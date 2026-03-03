---
name: nomadear-auth
description: >
  Sistema de autenticación JWT con roles para Nomadear.
  Trigger: trabajar con login, registro, JWT, roles, guards de auth, permisos
license: MIT
metadata:
  author: nomadear
  version: '1.0'
  scope: [root, auth]
  auto_invoke:
    - 'Implementar autenticación'
    - 'Trabajar con JWT'
    - 'Configurar roles'
    - 'Crear guard de auth'
    - 'Validar permisos'
    - 'Proteger endpoint'
allowed-tools: Read, Edit, Write, Glob, Grep, Bash
---

# Nomadear Auth Skill

## Critical Rules

### ALWAYS

- Usar `JwtAuthGuard` para endpoints protegidos
- Usar `RolesGuard` junto con `@Roles()` para control de acceso
- Hashear passwords con bcrypt (10 rounds)
- Validar `dealershipId` para usuarios no-ADMIN
- Excluir password de responses con `select` de Prisma

### NEVER

- Retornar passwords en responses
- Permitir registro sin validar rol del creador
- Saltear validación de dealershipId para ASESOR/USER
- Usar tokens sin expiración

---

## Roles del Sistema

```typescript
enum Role {
  ADMIN = 'ADMIN', // Acceso total, puede crear usuarios
  ASESOR = 'ASESOR', // Acceso a su dealership
  USER = 'USER', // Acceso limitado a su dealership
}
```

### Permisos por Rol

| Acción                                    | ADMIN | ASESOR                                   | USER |
| ----------------------------------------- | ----- | ---------------------------------------- | ---- |
| Ver todos los eventos (incl. suspendidos) | ✅    | ❌ (solo su dealership, sin suspendidos) | ❌   |
| Crear eventos                             | ✅    | ✅ (su dealership)                       | ❌   |
| Editar evento (título/ubicación/etc.)     | ✅    | ❌                                       | ❌   |
| Reprogramar evento                        | ✅    | ✅ (si es creador)                       | ❌   |
| Suspender evento                          | ✅    | ✅ (si es creador)                       | ❌   |
| Restaurar/reactivar evento                | ✅    | ❌                                       | ❌   |
| Ver historial de modificaciones           | ✅    | ✅ (su dealership)                       | ❌   |
| Preinscripciones (listar/rechazar)        | ✅    | ✅ (su dealership)                       | ❌   |
| Bulk upload CSV                           | ✅    | ✅ (su dealership)                       | ❌   |
| Inscribirse como asistente                | ✅    | ✅                                       | ✅   |
| Crear usuarios                            | ✅    | ❌                                       | ❌   |
| Ver/gestionar usuarios                    | ✅    | ❌                                       | ❌   |

---

## Proteger Endpoints

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

// Solo autenticado
@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile(@Request() req) {
  return req.user;
}

// Autenticado + rol específico
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Post('users')
createUser(@Body() dto: CreateUserDto) {}

// Múltiples roles permitidos
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'ASESOR')
@Get('events')
getEvents() {}
```

---

## Obtener Usuario Actual

```typescript
// En controller
@Get('profile')
@UseGuards(JwtAuthGuard)
getProfile(@Request() req) {
  // req.user contiene:
  // { sub: 'user-id', email: 'user@email.com', role: 'ADMIN', dealershipId: 'dealer-id' }
  return req.user;
}

// En service, pasar userId desde controller
async getMyEvents(userId: string) {
  return this.prisma.event.findMany({
    where: { createdById: userId },
  });
}
```

---

## Validar Acceso por Dealership

```typescript
// En service
async findEventsForUser(user: { role: string; dealershipId?: string }) {
  // ADMIN ve todo
  if (user.role === 'ADMIN') {
    return this.prisma.event.findMany({ where: { isActive: true } });
  }

  // ASESOR/USER solo su dealership
  if (!user.dealershipId) {
    throw new ForbiddenException('Usuario sin dealership asignado');
  }

  return this.prisma.event.findMany({
    where: {
      isActive: true,
      dealershipId: user.dealershipId,
    },
  });
}
```

---

## Login Flow

```typescript
// POST /auth/login
// Body: { email: string, password: string }
// Response: { access_token: string }

// El token contiene:
{
  sub: 'user-uuid',
  email: 'user@email.com',
  role: 'ADMIN',
  dealershipId: 'dealer-uuid' // null para ADMIN
}
```

---

## Register Flow (Solo ADMIN)

```typescript
// POST /auth/register (requiere JWT de ADMIN)
// Body:
{
  email: 'nuevo@email.com',
  password: 'password123',
  role: 'ASESOR',           // Opcional, default: USER
  dealershipId: 'uuid'      // Requerido para ASESOR/USER
}
```

---

## Archivos Clave

- `src/auth/auth.controller.ts` - Endpoints /auth/login, /auth/register
- `src/auth/auth.service.ts` - Lógica de validación y JWT
- `src/auth/users.service.ts` - CRUD de usuarios
- `src/auth/jwt.strategy.ts` - Estrategia Passport
- `src/auth/jwt-auth.guard.ts` - Guard de JWT
- `src/auth/guards/roles.guard.ts` - Guard de roles
- `src/auth/decorators/roles.decorator.ts` - Decorator @Roles()

---

## Testing Auth

```typescript
// Obtener token en tests E2E
const loginResponse = await request(app.getHttpServer())
  .post('/auth/login')
  .send({ email: 'admin@test.com', password: 'password' });

const token = loginResponse.body.access_token;

// Usar token
await request(app.getHttpServer())
  .get('/events')
  .set('Authorization', `Bearer ${token}`)
  .expect(200);
```
