---
id: mcp-builder-skill
title: "Claude Skill: MCP Builder"
sidebar_label: "MCP Builder"
---

# Claude Skill: MCP Builder

Skill que guía a Claude para **crear servidores MCP (Model Context Protocol) de alta calidad**, siguiendo las cuatro fases del ciclo: investigación, implementación, revisión y evaluaciones. Compatible con TypeScript (recomendado) y Python/FastMCP.

:::tip Descarga el skill
<a href="/flock-tech-guides/skills/mcp-builder/SKILL.md" download="SKILL.md">⬇ Descargar SKILL.md</a> — guardalo en `~/.claude/skills/mcp-builder/SKILL.md` para instalarlo directamente.
:::

## ¿Qué hace?

Cuando Claude construye un servidor MCP, este skill le indica:

- Investigar la especificación MCP y el SDK correspondiente antes de codear
- Diseñar herramientas con nombres descriptivos, prefijos consistentes y mensajes de error accionables
- Priorizar cobertura completa de la API sobre tools de workflow específicos
- Implementar schemas de entrada con Zod (TS) o Pydantic (Python), incluyendo `outputSchema`
- Anotar cada tool con hints (`readOnlyHint`, `destructiveHint`, `idempotentHint`, `openWorldHint`)
- Crear evaluaciones con 10 preguntas realistas y verificables para medir efectividad

## ¿Cuándo se activa?

> *"Crear servidor MCP"*, *"Build MCP server"*, *"Integrar API con MCP"*, *"MCP para [servicio]"*

## Stack recomendado

| Decisión | Recomendación | Motivo |
|---|---|---|
| **Lenguaje** | TypeScript | SDK de alta calidad, tipado estático, amplia compatibilidad |
| **Transport remoto** | Streamable HTTP stateless | Más fácil de escalar y mantener |
| **Transport local** | stdio | Estándar para servidores locales |
| **Schemas** | Zod (TS) / Pydantic (Python) | Validación robusta con tipos |

## Las 4 fases

### Fase 1: Investigación y planificación

- Leer la especificación MCP desde `https://modelcontextprotocol.io/sitemap.xml`
- Cargar el README del SDK (TypeScript o Python según el caso)
- Revisar la API del servicio a integrar: endpoints, autenticación, modelos de datos
- Decidir qué tools implementar priorizando cobertura sobre conveniencia

### Fase 2: Implementación

Infraestructura compartida primero:
- Cliente API con autenticación
- Helpers de manejo de errores
- Formateo de respuestas (JSON o Markdown según el contexto)
- Soporte de paginación

Para cada tool:
- Input schema con constraints y descripciones claras
- Output schema con `structuredContent` cuando sea posible
- Async/await para operaciones I/O
- Mensajes de error que guíen hacia soluciones

### Fase 3: Revisión y testing

```bash
# TypeScript — verificar compilación
npm run build

# Testear con MCP Inspector
npx @modelcontextprotocol/inspector

# Python — verificar sintaxis
python -m py_compile server.py
```

Checklist de calidad:
- Sin código duplicado (DRY)
- Manejo de errores consistente
- Cobertura de tipos completa
- Descripciones de tools claras

### Fase 4: Evaluaciones

Crear 10 preguntas de evaluación con estas características:
- Independientes entre sí
- Solo operaciones read-only
- Requieren múltiples tool calls
- Basadas en casos reales
- Con respuesta única verificable por comparación de string
- Estables en el tiempo

**Formato de salida:**

```xml
<evaluation>
  <qa_pair>
    <question>Pregunta compleja que requiere explorar datos reales...</question>
    <answer>respuesta exacta</answer>
  </qa_pair>
</evaluation>
```

## Convenciones de naming para tools

```
# Patrón: {servicio}_{verbo}_{recurso}
github_create_issue
github_list_repos
github_get_pull_request

# Verbos comunes
list_     → listado paginado
get_      → recurso específico por ID
create_   → crear nuevo recurso
update_   → modificar existente
delete_   → eliminar (marcar destructiveHint: true)
search_   → búsqueda con filtros
```

## Anotaciones de tools

```typescript
{
  readOnlyHint: true,      // No modifica estado del servidor
  destructiveHint: false,  // No puede causar pérdida de datos irreversible
  idempotentHint: true,    // Múltiples llamadas iguales = mismo resultado
  openWorldHint: false,    // Solo interactúa con recursos del servicio
}
```

## Recursos de referencia

Durante el desarrollo, cargar según la fase:

| Recurso | Cuándo cargarlo |
|---|---|
| Sitemap MCP | Fase 1 — investigación |
| TypeScript SDK README | Fase 1/2 — implementación TS |
| Python SDK README | Fase 1/2 — implementación Python |
| `reference/mcp_best_practices.md` | Fase 1 — siempre |
| `reference/node_mcp_server.md` | Fase 2 — implementación TS |
| `reference/python_mcp_server.md` | Fase 2 — implementación Python |
| `reference/evaluation.md` | Fase 4 — evaluaciones |

## Instalación rápida

1. Descargá el `SKILL.md` con el botón de arriba
2. Abrí Claude Code en tu terminal
3. Adjuntá el archivo y enviá:

> *"Instalá este skill en `~/.claude/skills/mcp-builder/SKILL.md`"*

## Nivel de aplicación

**Tipo:** Automático por inferencia | **Lenguaje:** TypeScript (recomendado) / Python | **Protocolo:** MCP
