---
name: state-machine
description: >
  Implementar máquinas de estado finitas (FSM) en cualquier módulo.
  Trigger: implementar FSM, máquina de estados, estados y transiciones, /state-machine
license: MIT
metadata:
  author: flock-engineering
  version: '1.0'
  scope: [root]
  auto_invoke:
    - 'Implementar FSM'
    - 'Máquina de estados'
    - 'Estados y transiciones'
    - '/state-machine'
allowed-tools: Read, Edit, Write, Glob, Grep, Bash
---

# State Machine Skill

## Uso

Invocar con: `/state-machine [módulo]`

Si no se especifica módulo, preguntá cuál quiere trabajar.

## Critical Rules

### ALWAYS

- Mostrar el **diagrama de transiciones en texto** antes de escribir código para validar con el usuario
- Usar enums para todos los estados y eventos — nunca strings literales sueltos
- Mantener `transition()` pura: sin efectos secundarios, solo retorna el estado siguiente
- Si el enum ya existe en el schema (Prisma, DB, etc.), importarlo — no duplicarlo

### NEVER

- Usar `any` — todos los estados y eventos deben estar tipados con enums
- Usar `!` (non-null assertion) — usar optional chaining o guards
- Dispersar lógica de cambio de estado en múltiples lugares del servicio

### CUÁNDO NO IMPLEMENTAR FSM

Si los estados son ≤ 2 simples sin riesgo de inconsistencia (ej: `active`/`inactive`), avisarle al usuario que una FSM es sobreingeniería y no implementarla.

---

## Step 1 — Leer contexto del módulo

Leer el `CLAUDE.md` o documentación del módulo y los archivos del servicio principal para identificar:
- Los **estados existentes** (enums, strings literales, flags booleanas)
- Las **transiciones actuales** (cómo se cambia de estado en el código)
- Los **eventos** que disparan cambios (validaciones, APIs externas, acciones del usuario/admin)

---

## Step 2 — Analizar el problema

Identificar en el código actual:
- **Flags booleanas independientes** que generan estados imposibles (ej: `isLoading=true` + `isError=true`)
- **Transiciones sin validar** donde se puede ir de cualquier estado a cualquier otro sin restricción
- **Lógica dispersa** de cambio de estado en múltiples lugares del servicio

---

## Step 3 — Diseñar la FSM (mostrar al usuario antes de escribir código)

```
Estados: [lista de estados mutuamente excluyentes]
Eventos: [lista de eventos que disparan transiciones]
Transiciones válidas:
  ESTADO_A + EVENTO_X → ESTADO_B
  ESTADO_A + EVENTO_Y → ESTADO_C
  ESTADO_B + EVENTO_Z → ESTADO_D
  (cualquier combinación no listada = ignorada)
```

---

## Step 4 — Implementar la FSM

Crear la carpeta `machine/` dentro del módulo con estos archivos:

### `{entidad}.states.ts` — Enums de estados y eventos

```typescript
export enum OrderState {
  PENDING   = 'pending',
  APPROVED  = 'approved',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum OrderEvent {
  APPROVE  = 'approve',
  DELIVER  = 'deliver',
  CANCEL   = 'cancel',
}
```

### `{entidad}.machine.ts` — Mapa de transiciones y función `transition()`

```typescript
import { OrderState, OrderEvent } from './order.states';

type TransitionMap = Partial<Record<OrderState, Partial<Record<OrderEvent, OrderState>>>>;

const machine: TransitionMap = {
  [OrderState.PENDING]: {
    [OrderEvent.APPROVE]: OrderState.APPROVED,
    [OrderEvent.CANCEL]:  OrderState.CANCELLED,
  },
  [OrderState.APPROVED]: {
    [OrderEvent.DELIVER]: OrderState.DELIVERED,
    [OrderEvent.CANCEL]:  OrderState.CANCELLED,
  },
};

export function transition(current: OrderState, event: OrderEvent): OrderState {
  const stateMap = machine[current];
  if (!stateMap) return current;
  const next = stateMap[event];
  return next ?? current;
}
```

---

## Step 5 — Integrar en el servicio

### Para servicios con estado en memoria (UI / backend en proceso)

```typescript
import { OrderState, OrderEvent } from './machine/order.states';
import { transition } from './machine/order.machine';

@Injectable()
export class OrderService {
  private state: OrderState = OrderState.PENDING;

  approve(): void {
    this.state = transition(this.state, OrderEvent.APPROVE);
  }

  // Getter opcional para compatibilidad con código existente
  get isApproved(): boolean {
    return this.state === OrderState.APPROVED;
  }
}
```

### Para entidades persistidas en base de datos (validar antes del update)

```typescript
async approve(id: string): Promise<void> {
  const entity = await this.repo.findOne(id);
  const nextStatus = transition(entity.status as OrderState, OrderEvent.APPROVE);

  if (nextStatus === entity.status) {
    throw new BadRequestException(
      `No se puede aprobar una orden en estado ${entity.status}`,
    );
  }

  await this.repo.update(id, { status: nextStatus });
}
```

### Con Audit Trail (si el módulo lo tiene)

```typescript
const from = entity.status as OrderState;
const to   = transition(from, OrderEvent.APPROVE);

if (to === from) {
  throw new BadRequestException(`Transición inválida desde ${from}`);
}

await this.repo.update(id, { status: to });
await this.auditLog.record({ entityId: id, from, to, event: OrderEvent.APPROVE });
```

---

## Step 6 — Actualizar documentación del módulo

Al finalizar, agregar en el `CLAUDE.md` del módulo:

```md
## Estado FSM

Estados: PENDING → APPROVED → DELIVERED | CANCELLED

Transiciones:
- PENDING  + APPROVE  → APPROVED
- PENDING  + CANCEL   → CANCELLED
- APPROVED + DELIVER  → DELIVERED
- APPROVED + CANCEL   → CANCELLED

Archivos: `machine/order.states.ts`, `machine/order.machine.ts`
```
