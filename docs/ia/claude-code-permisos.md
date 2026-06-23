---
id: claude-code-permisos
title: "Permisos de Claude Code"
sidebar_label: "Permisos de Claude Code"
---

# Permisos de Claude Code

Claude Code puede leer tu código, editar archivos y ejecutar comandos. El sistema de permisos es lo que define **qué puede hacer sin preguntarte y qué no**. Entenderlo bien es la diferencia entre trabajar rápido y con confianza, o frenarte en cada prompt — o peor, dejarlo hacer algo que no querías.

## El modelo por defecto

Por defecto, Claude Code arranca con permisos **estrictos de solo lectura**: puede ver tus archivos y correr comandos de lectura sin pedir nada, pero **cualquier acción que modifique estado te pide confirmación**.

| Tipo de operación | ¿Pide permiso? |
|---|---|
| Leer archivos (`Read`) | No |
| Comandos Bash de solo lectura (`ls`, `cat`, `grep`, `find`, `git status`…) | No |
| Editar o escribir archivos | Sí |
| Comandos Bash que modifican estado (`rm`, `git push`, `npm install`…) | Sí |
| Peticiones de red (`WebFetch`) | Sí |
| Herramientas de servidores MCP | Sí |

:::note
"Solo lectura por defecto" **no** significa que solo lea archivos. También corre comandos de shell de lectura sin prompt. Lo que se bloquea hasta tu OK es todo lo que **cambia** algo.
:::

## Los tres tipos de reglas

Las reglas de permiso viven en `settings.json` bajo la clave `permissions` y se dividen en tres listas:

- **`allow`** — Claude usa la herramienta sin pedir confirmación.
- **`ask`** — Claude pide confirmación, **incluso si hay una regla `allow` que coincide**.
- **`deny`** — Claude no puede usar la herramienta. Punto.

### Precedencia: la regla de oro

El orden de prioridad es siempre el mismo, **gane la primera que coincide**:

```
1. deny   (se evalúa primero — siempre bloquea)
2. ask    (pregunta aunque exista un allow más específico)
3. allow  (la de menor prioridad)
```

:::danger La especificidad NO cambia la precedencia
Una regla `deny` más amplia gana sobre una `allow` más específica. Esto bloquea, aunque el `allow` sea más puntual:

```json
{
  "permissions": {
    "allow": ["Bash(aws s3 ls)"],
    "deny": ["Bash(aws *)"]
  }
}
```

Las reglas `deny` **no admiten excepciones** vía `allow`.
:::

## Jerarquía de configuración

Las reglas pueden venir de cinco lugares. Cuando hay conflicto, gana el de mayor prioridad:

| Prioridad | Origen | Archivo | ¿Se comparte? | ¿Se puede sobrescribir? |
|---|---|---|---|---|
| 1 (máxima) | Política gestionada (empresa/MDM) | `managed-settings.json` | Sí (toda la org) | **No** |
| 2 | Argumentos de línea de comandos | `--permission-mode`, `--allowedTools` | Solo la sesión | Sí |
| 3 | Proyecto local | `.claude/settings.local.json` | No (fuera de git) | Sí |
| 4 | Proyecto compartido | `.claude/settings.json` | Sí (en git) | Sí |
| 5 (mínima) | Usuario global | `~/.claude/settings.json` | No | Sí |

:::tip
La **política gestionada** no la puede pisar nadie — ni siquiera los argumentos de línea de comandos. Es la herramienta de los equipos de plataforma/seguridad para imponer límites a toda la organización.
:::

El archivo `.claude/settings.local.json` lo agrega Claude Code automáticamente al `.gitignore`, así que es el lugar para tus reglas personales del proyecto que no querés commitear.

## Modos de permiso

Más allá de las reglas, hay **modos** que cambian el comportamiento global de la sesión. Se ciclan con `Shift+Tab`:

| Modo | Qué corre sin preguntar | Ideal para |
|---|---|---|
| `default` | Solo lecturas | Trabajo cotidiano, tareas sensibles |
| `acceptEdits` | Lecturas + edición de archivos + comandos fs comunes (`mkdir`, `mv`, `cp`…) | Iterar rápido sobre código en un proyecto de confianza |
| `plan` | Solo lecturas; **no ejecuta nada**, solo propone un plan | Explorar y diseñar antes de tocar nada |
| `auto` | Casi todo, con un clasificador de seguridad en background | Tareas largas con menos interrupciones |
| `dontAsk` | Solo las reglas `allow` preaprobadas (sin prompts) | CI / scripts no interactivos |
| `bypassPermissions` | **Todo** (inseguro) | Solo en contenedores/VMs aislados |

:::warning
El modo `auto` es un *research preview* que reduce prompts apoyándose en un clasificador — **no reemplaza** a las reglas de permiso. Tus límites explícitos (`ask`, `deny`) se siguen respetando.
:::

Podés fijar el modo de arranque del proyecto con `defaultMode`:

```json
{
  "permissions": {
    "defaultMode": "acceptEdits"
  }
}
```

## Sintaxis de reglas por herramienta

### Bash

```json
{
  "permissions": {
    "allow": [
      "Bash(npm run *)",
      "Bash(git commit *)"
    ],
    "deny": ["Bash(git push --force *)"]
  }
}
```

El espacio importa: `Bash(ls *)` matchea `ls -la` (límite de palabra) pero **no** `lsof`. `Bash(ls*)` matchea ambos. La forma `Bash(ls:*)` equivale a `Bash(ls *)`.

:::danger Las reglas de Bash NO son una frontera de seguridad
Intentar restringir argumentos de comandos con patrones de Bash es **frágil**. Una regla como `Bash(curl http://github.com/ *)` se evade fácil:

- `curl -X GET http://github.com/...` (opciones antes de la URL)
- `curl https://github.com/...` (otro protocolo)
- `curl -L http://bit.ly/xyz` (redirects)
- `URL=http://github.com && curl $URL` (variables)

Para filtrar URLs de forma confiable, usá reglas de `WebFetch` con dominios, no patrones de Bash.
:::

### Read y Edit (estilo `.gitignore`)

```json
{
  "permissions": {
    "deny": [
      "Read(.env)",
      "Read(./secrets/**)",
      "Edit(//**/.env)"
    ]
  }
}
```

Anclas de ruta:

| Prefijo | Significado |
|---|---|
| `//` | Ruta absoluta desde la raíz del filesystem |
| `~/` | Directorio home |
| `/` | Relativa a la **raíz del proyecto** |
| (ninguno) | Relativa al **directorio actual** |

`*` matchea dentro de un segmento; `**` cruza directorios. `Read(.env)` y `Read(**/.env)` son equivalentes.

:::note
Las reglas `deny` de `Read`/`Edit` aplican a las herramientas de archivo de Claude y a comandos que reconoce en Bash (`cat`, `head`, `sed`…), pero **no** a subprocesos arbitrarios — un script de Python o Node que abre archivos por su cuenta las esquiva. Para enforcement a nivel SO, usá sandboxing.
:::

### WebFetch

```json
{
  "permissions": {
    "allow": [
      "WebFetch(domain:github.com)",
      "WebFetch(domain:*.example.com)"
    ],
    "deny": ["WebFetch(domain:evil.com)"]
  }
}
```

El match es case-insensitive. `*.example.com` matchea `api.example.com` pero **no** `example.com` a secas.

### Herramientas MCP

```json
{
  "permissions": {
    "allow": ["mcp__github__get_file_contents"],
    "deny": ["mcp__*"]
  }
}
```

Los patrones con comodín (`mcp__github__get_*`) solo se permiten en `deny` y `ask`; las reglas `allow` deben ser específicas.

## Acceso a directorios adicionales

Por defecto Claude solo trabaja en el directorio actual. Para extender el acceso de lectura/edición:

```json
{
  "permissions": {
    "additionalDirectories": ["~/shared-code", "/opt/monorepo"]
  }
}
```

Esto otorga **acceso a archivos**, no descubrimiento completo de configuración de esos directorios.

## El comando `/permissions`

Desde la sesión, `/permissions` (alias `/allowed-tools`) abre un diálogo interactivo donde podés:

- Ver las reglas por ámbito (gestionada, usuario, proyecto, local)
- Agregar o quitar reglas `allow`/`ask`/`deny`
- Administrar los directorios de trabajo

Es la forma rápida de ajustar permisos sin editar JSON a mano.

## La opción nuclear: `--dangerously-skip-permissions`

```bash
claude --dangerously-skip-permissions
```

Activa el modo `bypassPermissions`: **omite todos los prompts**. Es equivalente a `claude --permission-mode bypassPermissions`.

:::danger Usalo solo en entornos aislados
La guía oficial de Anthropic es clara: usalo **únicamente** en contenedores, VMs o dev containers sin acceso a internet, donde Claude Code no pueda dañar tu sistema host. Nunca sobre un directorio con API keys o configuración de producción.

Un *circuit breaker* sigue activo igual: `rm -rf /` y `rm -rf ~` siguen pidiendo confirmación. Y no se puede arrancar como `root` ni con `sudo`.
:::

## Configuraciones recomendadas

**Trabajo cotidiano balanceado** — acelera lo seguro, protege lo sensible:

```json
{
  "permissions": {
    "defaultMode": "acceptEdits",
    "allow": [
      "Bash(npm run *)",
      "Bash(git commit *)",
      "Bash(git push origin *)"
    ],
    "deny": [
      "Bash(rm -rf *)",
      "Bash(git push --force *)",
      "Read(.env*)"
    ]
  }
}
```

**CI / no interactivo** — solo lo preaprobado, sin prompts:

```json
{
  "permissions": {
    "defaultMode": "dontAsk",
    "allow": [
      "Bash(npm test)",
      "Bash(npm run build)",
      "Bash(git status)"
    ]
  }
}
```

## Para recordar

- Por defecto, **lectura libre, escritura con permiso**. El sistema es seguro de arranque.
- **`deny` > `ask` > `allow`**, y la especificidad no rompe ese orden.
- La **política gestionada** gana sobre todo lo demás.
- Las reglas de Bash sobre argumentos son **best-effort, no seguridad real** — para filtrar red usá `WebFetch`.
- `--dangerously-skip-permissions` es solo para **entornos aislados**.

---

*Fuente: [Claude Code Documentation — Permissions, Security & Settings](https://docs.claude.com/en/docs/claude-code), Anthropic. Verificado en junio 2026.*
