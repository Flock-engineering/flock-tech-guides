---
name: nomadear-bot
description: Bot IA con Google Vertex AI Discovery Engine para Nomadear. Trigger: trabajar con bot, Vertex AI, Discovery Engine, GCP credentials, preguntas IA
license: MIT
metadata:
  author: nomadear
  version: '1.0'
  scope: [root, bot]
  auto_invoke:
    - 'Trabajar con el bot'
    - 'Configurar Vertex AI'
    - 'Modificar Discovery Engine'
    - 'Manejar credenciales GCP'
---

# Nomadear Bot Skill

## Critical Rules

### ALWAYS

- Usar variables de entorno para credenciales GCP (nunca hardcodear)
- Soportar dos modos de auth: archivo (local) y JSON env var (producción)
- Reiniciar sesión si Google devuelve 400 o 404
- Validar `question` con `class-validator` (3-500 chars)

### NEVER

- Commitear credenciales GCP en el código
- Hardcodear `projectId` o `engineId`
- Exponer errores internos de Google al cliente

---

## Endpoint

```
POST /bot/ask  (sin auth — endpoint público)
Body: { question: string }  // 3-500 caracteres
Response: { botResponse: string }
```

---

## Variables de Entorno

```bash
GCP_PROJECT_ID=mi-proyecto-gcp
GCP_ENGINE_ID=mi-engine-id
GCP_LOCATION=global              # default: global

# Producción (JSON como string en env var):
GCP_CREDENTIALS_JSON='{"type":"service_account","project_id":"...","private_key":"...",...}'

# Desarrollo local (path a archivo de credenciales):
GOOGLE_APPLICATION_CREDENTIALS=/ruta/al/credentials.json
```

---

## Archivos Clave

- `src/bot/bot.controller.ts` - Endpoint POST /bot/ask
- `src/bot/bot.service.ts` - Servicio que delega a DiscoveryService
- `src/bot/providers/discovery.service.ts` - Llamadas a Vertex AI Discovery Engine
- `src/bot/dto/ask-bot.dto.ts` - DTO con validación de `question`
- `src/bot/bot.module.ts` - Módulo NestJS

---

## Flujo de Autenticación GCP

```typescript
// En DiscoveryService, el cliente se inicializa según entorno:

// PRODUCCIÓN: credenciales desde env var JSON
if (process.env.GCP_CREDENTIALS_JSON) {
  const credentials = JSON.parse(process.env.GCP_CREDENTIALS_JSON);
  // usar credentials objeto directamente
}

// DESARROLLO LOCAL: desde archivo en disco
// GOOGLE_APPLICATION_CREDENTIALS apunta al archivo
// Google SDK lo detecta automáticamente (Application Default Credentials)
```

---

## Llamada a Discovery Engine

```typescript
// El bot mantiene sessionId y queryId para contexto de conversación
// Si la sesión expira (400/404), se reinicia automáticamente

// Configuración de la llamada:
{
  query: { text: userQuestion },
  session: sessionId,
  queryId: queryId,
  answerGenerationSpec: {
    includeCitations: true,
  },
  relatedQuestionsSpec: {
    enable: true,
  }
}
```

---

## DTO

```typescript
// src/bot/dto/ask-bot.dto.ts
import { IsString, MinLength, MaxLength } from 'class-validator';

export class AskBotDto {
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  question: string;
}
```

---

## Manejo de Errores

```typescript
// En el controller/service:
try {
  const response = await this.botService.ask(dto.question);
  return { botResponse: response };
} catch (error) {
  // Loggear el error internamente
  throw new InternalServerErrorException('Error al consultar el bot');
}

// NO exponer detalles internos de Google al cliente
```
