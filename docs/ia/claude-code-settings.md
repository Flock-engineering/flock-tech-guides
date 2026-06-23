---
id: claude-code-settings
title: "Configuración de Claude Code"
sidebar_label: "Configuración de Claude Code"
---

# Configuración de Claude Code

Casi todo el comportamiento de Claude Code se controla desde un archivo `settings.json`: qué modelo usa, qué variables de entorno levanta, qué hooks corre, los permisos, y mucho más. Entender dónde vive ese archivo y qué podés poner adentro es lo que te permite configurar tu entorno una vez y olvidarte.

## Dónde viven los archivos

No hay un solo `settings.json` — hay varios, según el alcance. Cuando dos definen la misma clave, **gana el de mayor prioridad**:

| Prioridad | Archivo | Alcance | ¿Se comparte? |
|---|---|---|---|
| 1 (máxima) | Política gestionada (empresa/MDM) | Toda la organización | Sí, impuesta |
| 2 | Argumentos de línea de comandos | Solo la sesión | No |
| 3 | `.claude/settings.local.json` | Este proyecto, solo vos | No (fuera de git) |
| 4 | `.claude/settings.json` | Este proyecto, todo el equipo | Sí (en git) |
| 5 (mínima) | `~/.claude/settings.json` | Todos tus proyectos | No |

La regla mental es simple:

- **`~/.claude/settings.json`** → tus preferencias personales (modelo favorito, vim mode, idioma). Aplican a todos tus repos.
- **`.claude/settings.json`** → las reglas del equipo. Se commitea, así todos arrancan con la misma config.
- **`.claude/settings.local.json`** → tus ajustes para ESTE proyecto que no querés compartir. Claude Code lo agrega solo al `.gitignore`.

:::tip[La precedencia en detalle]
La lógica de precedencia es la misma que usan los permisos. Si querés el detalle fino de cómo se resuelven los conflictos de reglas (`deny > ask > allow`), está en la guía de [Permisos de Claude Code](./claude-code-permisos).
:::

## Las claves principales

`settings.json` tiene **muchísimas** claves (más de 100). Estas son las que vas a tocar en el día a día:

| Clave | Tipo | Qué hace |
|---|---|---|
| `permissions` | objeto | Reglas `allow` / `ask` / `deny` de acceso a herramientas (ver [guía de permisos](./claude-code-permisos)) |
| `model` | string | Modelo por defecto (`opus`, `sonnet`, `haiku`…) |
| `env` | objeto | Variables de entorno que se inyectan en cada sesión |
| `hooks` | objeto | Comandos que corren en eventos del ciclo de vida (`PreToolUse`, `PostToolUse`, etc.) |
| `outputStyle` | string | Estilo de respuesta de Claude |
| `editorMode` | string | Modo de edición: `normal` o `vim` |
| `language` | string | Idioma de las respuestas de Claude |
| `cleanupPeriodDays` | número | Días antes de borrar archivos de sesiones viejas |
| `enableAllProjectMcpServers` | booleano | Auto-aprobar todos los servidores MCP del `.mcp.json` del proyecto |

:::info[La fuente definitiva es el schema]
La lista completa de claves cambia entre versiones de Claude Code. Cuando necesites una clave puntual o quieras autocompletado, la referencia autoritativa es el [JSON schema oficial](https://json.schemastore.org/claude-code-settings.json). Apuntá tu editor ahí y vas a tener validación en vivo.
:::

## MCP no va acá

Un error común: pensar que los servidores MCP se configuran en `settings.json`. **No.** Los servidores viven en archivos aparte:

- **`.mcp.json`** (raíz del proyecto, se commitea) → servidores compartidos con el equipo.
- **`~/.claude.json`** (tu home) → tus servidores MCP personales.

En `settings.json` solo van las claves de **control** sobre esos servidores: `enableAllProjectMcpServers`, `enabledMcpjsonServers`, `disabledMcpjsonServers` y similares. La definición de cada servidor (comando, args, env) va en `.mcp.json`.

## Ejemplos por caso de uso

**Config personal (`~/.claude/settings.json`)** — tus preferencias globales:

```json
{
  "model": "opus",
  "editorMode": "vim",
  "language": "es",
  "permissions": {
    "deny": ["Bash(rm -rf /)"]
  }
}
```

**Config de equipo (`.claude/settings.json`)** — se commitea, todos arrancan igual:

```json
{
  "permissions": {
    "allow": ["Bash(npm run *)", "Bash(git commit *)"],
    "deny": ["Bash(git push --force *)"]
  },
  "enableAllProjectMcpServers": true,
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit",
        "hooks": [{ "type": "command", "command": "./scripts/lint.sh" }]
      }
    ]
  },
  "env": {
    "NEXT_PUBLIC_API_URL": "https://api.dev.example.com"
  }
}
```

**Config restringida para CI (`.claude/settings.local.json`)** — no interactivo, acotado:

```json
{
  "model": "haiku",
  "permissions": {
    "defaultMode": "dontAsk",
    "allow": ["Bash(npm test)", "Bash(npm run build)"]
  }
}
```

## Editar desde la sesión: `/config`

No hace falta abrir el JSON a mano. Desde adentro de Claude Code, el comando `/config` abre una interfaz para ver y cambiar la configuración. Los cambios de permisos y hooks se aplican al toque; los de modelo o estilo pueden necesitar reiniciar la sesión (o usá `/model` para cambiar el modelo en caliente).

## Para recordar

- Hay **varios** `settings.json` por alcance; gana el de mayor prioridad (managed → CLI → local → proyecto → usuario).
- Lo personal va en `~/.claude/`, lo del equipo en `.claude/settings.json` (commiteado), lo privado del proyecto en `.claude/settings.local.json` (gitignoreado).
- **MCP NO va en `settings.json`** — va en `.mcp.json` / `~/.claude.json`.
- Para la lista completa de claves, el [JSON schema](https://json.schemastore.org/claude-code-settings.json) es la fuente definitiva.

---

*Fuente: [Claude Code Documentation — Settings](https://docs.claude.com/en/docs/claude-code), Anthropic. Verificado en junio 2026.*
