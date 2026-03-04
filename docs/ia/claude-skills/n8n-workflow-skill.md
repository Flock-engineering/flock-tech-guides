---
id: n8n-workflow-skill
title: "Claude Skill: N8N Workflow"
sidebar_label: "N8N Workflow Skill"
---

# Claude Skill: N8N Workflow

Skill que guía a Claude para **generar JSON de flujos N8N** válidos, seguros y con manejo de errores — incluyendo protección contra loops infinitos, hardcoding de credenciales y ejecuciones descontroladas.

:::tip Descarga el skill
<a href="/flock-tech-guides/skills/n8n-workflow/SKILL.md" download="SKILL.md">⬇ Descargar SKILL.md</a> — guardalo en `~/.claude/skills/n8n-workflow/SKILL.md` para instalarlo directamente.
:::

## ¿Qué hace?

Cuando Claude genera un workflow de N8N, este skill le indica:

- Cómo estructurar el **JSON completo** de un workflow (nodes, connections, settings)
- Patrones de nodos más usados: Schedule, Webhook, HTTP Request, IF, Set, SplitInBatches
- Cómo agregar **manejo de errores** con `continueOnFail` + IF + Stop And Error
- **Protecciones de seguridad**: sin credenciales hardcodeadas, timeouts obligatorios, throttling en loops
- Cómo confirmar la estructura con el usuario antes de generar
- Cómo reportar qué credenciales y configuraciones manuales se necesitan

## ¿Cuándo se activa?

Claude lo invoca automáticamente al detectar:

> *"Crear flujo N8N"*, *"Generar workflow N8N"*, *"Automatizar con N8N"*, *"Crear workflow de automatización"*

## Características del skill

| Característica | Descripción |
|---|---|
| **Confirmación previa** | Muestra el diagrama de flujo y espera aprobación antes de generar |
| **Siempre `active: false`** | El usuario activa manualmente tras revisar |
| **Timeout obligatorio** | Todos los nodos HTTP incluyen `timeout: 10000ms` |
| **Sin credenciales hardcodeadas** | Las API keys se referencian por nombre de credencial N8N |
| **Error branch** | Todo workflow incluye rama de error con Stop And Error |
| **Throttling en loops** | Agrega nodo Wait en bucles que llaman APIs externas |
| **Loops acotados** | SplitInBatches con `batchSize` definido (máx 100) |
| **Webhooks con auth** | Siempre configura `headerAuth` en webhooks públicos |

## Tipos de nodos cubiertos

| Nodo | Uso |
|---|---|
| **Schedule Trigger** | Ejecución programada (cron) |
| **Webhook** | Recibir llamadas HTTP externas |
| **HTTP Request** | Llamar APIs externas con retry y timeout |
| **IF** | Bifurcación condicional (incluido chequeo de errores) |
| **Set** | Mapear y transformar campos |
| **SplitInBatches** | Procesar listas en lotes con límite |
| **Wait** | Throttling / rate limiting entre llamadas |
| **Stop And Error** | Detener ejecución con mensaje descriptivo |
| **Code** | Lógica custom en JS o Python |

## Ejemplo de estructura generada

Claude siempre muestra primero el diagrama para confirmar:

```
📋 Estructura del workflow: "Sincronizar contactos cada hora"

[Schedule Trigger] → [HTTP: Obtener contactos] → [IF: ¿Error?]
                                                       ├── Sí → [Stop And Error]
                                                       └── No → [Procesar en Lotes]
                                                                      ↓
                                                             [Rate Limit (1s)]
                                                                      ↓
                                                             [HTTP: Enviar a CRM]

Nodos: 7 | Trigger: Cada 1 hora | APIs: api.origen.com, crm.ejemplo.com
Credenciales necesarias: "API Key - Origen", "API Key - CRM"

¿Confirmás esta estructura? (s/n)
```

Luego genera el JSON completo e indica qué credenciales configurar manualmente en N8N.

## Protecciones de seguridad

El skill garantiza que el JSON generado:

- ✅ **No contiene** API keys, tokens o passwords en texto plano
- ✅ **Tiene timeout** en todos los nodos HTTP (10 segundos por defecto)
- ✅ **Limita loops** con batchSize y nunca crea ciclos infinitos
- ✅ **Inicia inactivo** — `"active": false` siempre
- ✅ **Valida webhooks** con autenticación por header
- ✅ **Maneja errores** en cada rama crítica del flujo

## Instalación rápida

1. Descargá el `SKILL.md` con el botón de arriba
2. Abrí Claude Code en tu terminal
3. Adjuntá el archivo y enviá:

> *"Instalá este skill en `~/.claude/skills/n8n-workflow/SKILL.md`"*

## Nivel de aplicación

**Tipo:** Automático por inferencia | **Nivel:** Avanzado
