---
id: n8n-workflow-skill-raw
title: "SKILL.md — N8N Workflow"
sidebar_label: "SKILL.md"
---

# SKILL.md — N8N Workflow

Archivo de instrucciones que Claude usa internamente. Si encontrás algo para mejorar, abrí un PR directamente.

:::info Contribuir
[✏️ Sugerir corrección en GitHub](https://github.com/Flock-engineering/flock-tech-guides/edit/dev/static/skills/n8n-workflow/SKILL.md) — GitHub te propone hacer fork y PR automáticamente si no tenés permisos de push.
:::

[⬇ Descargar SKILL.md](pathname:///flock-tech-guides/skills/n8n-workflow/SKILL.md)

---

````md
---
name: n8n-workflow
description: >
  Genera JSON de flujos N8N válidos, seguros y con manejo de errores.
  Trigger: crear flujo N8N, generar workflow N8N, automatizar con N8N, crear workflow de automatización
argument-hint: "[descripción del workflow a automatizar]"
license: MIT
metadata:
  author: flock
  version: '1.0'
  scope: [root]
  auto_invoke:
    - 'Crear flujo N8N'
    - 'Generar workflow N8N'
    - 'Automatizar con N8N'
    - 'Crear workflow de automatización'
allowed-tools: Read, Write, Bash, Glob
context: fork
---

# N8N Workflow Skill

## Critical Rules

### ALWAYS

- Generar con `"active": false` — el usuario activa manualmente tras revisar
- Usar UUIDs únicos en cada campo `"id"` de nodo
- Usar `"executionOrder": "v1"` en `settings`
- Agregar timeout en todos los nodos HTTP Request (`"options": {"timeout": 10000}`)
- Referenciar credenciales por nombre, nunca hardcodear tokens o API keys
- Incluir rama de error: `continueOnFail: true` + nodo IF de chequeo + Stop And Error
- Limitar loops: usar SplitInBatches con `batchSize` definido (máx 100)
- Agregar nodo Wait (throttle) cuando se llaman APIs externas en bucles
- Validar campos requeridos en Webhook antes de procesar
- Mostrar el diagrama de flujo al usuario y esperar confirmación antes de generar el JSON

### NEVER

- Hardcodear API keys, tokens, passwords o secrets en `"parameters"`
- Crear conexiones cíclicas sin condición de salida (loops infinitos)
- Dejar ramas de error vacías (siempre agregar Stop And Error o notificación)
- Generar con `"active": true`
- Usar nodos Code para manejar autenticación (usar credential references)
- Crear nodos HTTP sin timeout
- Iterar sobre datasets sin límite de items (sin paginación ni batchSize)
- Usar `Execute Workflow` de forma recursiva sin profundidad máxima

---

## 1. Entender el Workflow

Analizá `$ARGUMENTS` o la descripción del usuario:

- **Trigger**: ¿Qué dispara el flujo? (Schedule, Webhook, Manual, App Trigger)
- **Acciones**: ¿Qué hace? (HTTP calls, transformaciones, DB, notificaciones)
- **Error handling**: ¿Qué pasa si falla? (retry, notificación, log)
- **Frecuencia / volumen**: ¿Cuántos items por ejecución? ¿Con qué frecuencia?

Si la descripción es vaga → preguntá estos puntos antes de continuar.

---

## 2. Confirmar Estructura

Mostrá el diagrama de flujo en texto y esperá confirmación explícita:

```
📋 Estructura del workflow: "nombre-del-workflow"

[Schedule Trigger] → [HTTP: Obtener datos] → [IF: ¿Error?]
                                                    ├── Sí → [Stop And Error]
                                                    └── No → [Set: Formatear] → [HTTP: Enviar resultado]

Nodos: 6 | Trigger: Cada 1 hora | APIs: api.ejemplo.com
Credenciales necesarias: API_KEY_EJEMPLO

¿Confirmás esta estructura? (s/n)
```

No continúes sin respuesta afirmativa.

---

## 3. Generar el JSON

### Skeleton Base

```json
{
  "name": "Nombre del Workflow",
  "nodes": [],
  "connections": {},
  "active": false,
  "settings": {
    "executionOrder": "v1",
    "timezone": "America/Argentina/Buenos_Aires",
    "saveManualExecutions": true,
    "callerPolicy": "workflowsFromSameOwner",
    "errorWorkflow": ""
  },
  "meta": {
    "instanceId": ""
  }
}
```

### Nodo: Schedule Trigger

```json
{
  "parameters": {
    "rule": {
      "interval": [{ "field": "hours", "hoursInterval": 1 }]
    }
  },
  "id": "GENERAR-UUID-UNICO",
  "name": "Schedule Trigger",
  "type": "n8n-nodes-base.scheduleTrigger",
  "typeVersion": 1.2,
  "position": [250, 300]
}
```

### Nodo: Webhook Trigger (con validación)

```json
{
  "parameters": {
    "httpMethod": "POST",
    "path": "mi-webhook",
    "authentication": "headerAuth",
    "responseMode": "responseNode",
    "options": {}
  },
  "id": "GENERAR-UUID-UNICO",
  "name": "Webhook",
  "type": "n8n-nodes-base.webhook",
  "typeVersion": 2,
  "position": [250, 300],
  "webhookId": "GENERAR-UUID-UNICO"
}
```

> Siempre usar `"authentication": "headerAuth"` en webhooks públicos para prevenir abuso.

### Nodo: HTTP Request (seguro)

```json
{
  "parameters": {
    "method": "GET",
    "url": "https://api.ejemplo.com/endpoint",
    "authentication": "genericCredentialType",
    "genericAuthType": "httpHeaderAuth",
    "sendHeaders": true,
    "headerParameters": {
      "parameters": [{ "name": "Accept", "value": "application/json" }]
    },
    "options": {
      "timeout": 10000,
      "retry": {
        "enabled": true,
        "maxRetries": 3,
        "retryInterval": 1000
      }
    }
  },
  "id": "GENERAR-UUID-UNICO",
  "name": "HTTP: Obtener Datos",
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.2,
  "position": [500, 300],
  "continueOnFail": true,
  "credentials": {
    "httpHeaderAuth": {
      "id": "CREDENTIAL_ID",
      "name": "API Key - Ejemplo"
    }
  }
}
```

### Nodo: IF — Chequeo de Error

```json
{
  "parameters": {
    "conditions": {
      "options": {
        "caseSensitive": true,
        "leftValue": "",
        "typeValidation": "strict"
      },
      "conditions": [
        {
          "id": "GENERAR-UUID-UNICO",
          "leftValue": "={{ $json.error }}",
          "rightValue": "",
          "operator": {
            "type": "string",
            "operation": "exists"
          }
        }
      ],
      "combinator": "and"
    }
  },
  "id": "GENERAR-UUID-UNICO",
  "name": "IF: ¿Hubo Error?",
  "type": "n8n-nodes-base.if",
  "typeVersion": 2,
  "position": [750, 300]
}
```

> Salida `true` (índice 0) → rama de error. Salida `false` (índice 1) → flujo normal.

### Nodo: Stop And Error

```json
{
  "parameters": {
    "errorMessage": "={{ 'Error en ' + $node['HTTP: Obtener Datos'].name + ': ' + ($json.error?.message ?? 'Error desconocido') }}"
  },
  "id": "GENERAR-UUID-UNICO",
  "name": "Stop And Error",
  "type": "n8n-nodes-base.stopAndError",
  "typeVersion": 1,
  "position": [1000, 200]
}
```

### Nodo: Loop con Límite (SplitInBatches)

```json
{
  "parameters": {
    "batchSize": 10,
    "options": {}
  },
  "id": "GENERAR-UUID-UNICO",
  "name": "Procesar en Lotes",
  "type": "n8n-nodes-base.splitInBatches",
  "typeVersion": 3,
  "position": [500, 300]
}
```

> Conectar la salida `done` (índice 1) hacia el siguiente paso. La salida `loop` (índice 0) vuelve al inicio del loop.

### Nodo: Throttle / Rate Limit

```json
{
  "parameters": {
    "amount": 1,
    "unit": "seconds"
  },
  "id": "GENERAR-UUID-UNICO",
  "name": "Rate Limit (1s)",
  "type": "n8n-nodes-base.wait",
  "typeVersion": 1.1,
  "position": [750, 500],
  "webhookId": "GENERAR-UUID-UNICO"
}
```

> Usar siempre dentro de loops que llamen APIs externas para evitar rate limit errors.

### Nodo: Set (mapear campos)

```json
{
  "parameters": {
    "mode": "manual",
    "duplicateItem": false,
    "assignments": {
      "assignments": [
        {
          "id": "GENERAR-UUID-UNICO",
          "name": "campo_salida",
          "value": "={{ $json.campo_entrada }}",
          "type": "string"
        }
      ]
    },
    "options": {}
  },
  "id": "GENERAR-UUID-UNICO",
  "name": "Set: Formatear Datos",
  "type": "n8n-nodes-base.set",
  "typeVersion": 3.4,
  "position": [1000, 300]
}
```

### Connections Pattern

```json
"connections": {
  "Schedule Trigger": {
    "main": [[{ "node": "HTTP: Obtener Datos", "type": "main", "index": 0 }]]
  },
  "HTTP: Obtener Datos": {
    "main": [[{ "node": "IF: ¿Hubo Error?", "type": "main", "index": 0 }]]
  },
  "IF: ¿Hubo Error?": {
    "main": [
      [{ "node": "Stop And Error", "type": "main", "index": 0 }],
      [{ "node": "Set: Formatear Datos", "type": "main", "index": 0 }]
    ]
  }
}
```

---

## 4. Checklist de Seguridad (pre-entrega)

Antes de generar el JSON final, verificá:

- [ ] Todos los nodos tienen `id` único (UUID v4)
- [ ] Ningún parámetro contiene strings que parezcan tokens o API keys reales
- [ ] Todos los nodos HTTP tienen `"timeout": 10000` en `options`
- [ ] Todos los loops tienen `batchSize` definido (≤ 100)
- [ ] Ramas de error no están vacías
- [ ] Webhooks públicos tienen `"authentication"` configurado
- [ ] El JSON tiene `"active": false`
- [ ] Las credenciales solo se referencian por nombre, nunca por valor

---

## 5. Entregar al Usuario

Respondé con:

1. **El JSON completo** del workflow (bloque de código)
2. **Cómo importarlo**:
   ```
   N8N → Workflows → Import from file / Import from URL → pegar JSON
   ```
3. **Credenciales a configurar** (lista de lo que necesita conectar manualmente)
4. **Nodos que requieren configuración adicional** (IDs de credencial, paths de webhook, etc.)
5. **Consideraciones de seguridad** específicas del workflow generado

---

## Commands

```bash
# Validar JSON generado (en terminal)
echo '{ ... }' | python3 -m json.tool

# Importar via CLI de N8N (si está instalado)
n8n import:workflow --input=workflow.json

# Exportar workflow existente para referencia
n8n export:workflow --id=WORKFLOW_ID --output=workflow.json
```

---

## Tipos de Nodo más Usados

| Tipo | `type` en JSON |
|---|---|
| Schedule (Cron) | `n8n-nodes-base.scheduleTrigger` |
| Webhook | `n8n-nodes-base.webhook` |
| HTTP Request | `n8n-nodes-base.httpRequest` |
| IF (condición) | `n8n-nodes-base.if` |
| Switch | `n8n-nodes-base.switch` |
| Merge | `n8n-nodes-base.merge` |
| Set (asignar vars) | `n8n-nodes-base.set` |
| Code (JS/Python) | `n8n-nodes-base.code` |
| Wait (throttle) | `n8n-nodes-base.wait` |
| SplitInBatches | `n8n-nodes-base.splitInBatches` |
| Stop And Error | `n8n-nodes-base.stopAndError` |
| Error Trigger | `n8n-nodes-base.errorTrigger` |
| No Operation | `n8n-nodes-base.noOp` |

---

## Project-Specific Notes

Adaptá esta sección a tu instancia de N8N:

- URL de la instancia: `http://localhost:5678` (local) o tu URL de producción
- Timezone por defecto del proyecto
- Prefijo de nombres de credenciales del equipo (ej: `"API Key - Servicio"`)
- Workflow de error global (configurar en `settings.errorWorkflow`)
````
