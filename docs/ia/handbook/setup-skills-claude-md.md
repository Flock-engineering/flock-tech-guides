---
sidebar_label: Skills y CLAUDE.md
---

# Setup de Skills y CLAUDE.md

---

## Dos capas, un solo contexto

Claude Code tiene dos mecanismos para recibir instrucciones: **CLAUDE.md** y **Skills**. Los dos se complementan, pero cumplen roles distintos.

**CLAUDE.md** define QUE hacer en este proyecto. Es el contrato: stack, convenciones, reglas, arquitectura. Todo lo que aplica especificamente a ESTE repositorio.

**Skills** definen COMO hacer un tipo de tarea. Son expertise reutilizable: como crear un componente Angular, como escribir tests, como configurar Docker. Aplican a cualquier proyecto donde esa tecnologia aparezca.

La analogia es simple. CLAUDE.md es el plano de TU edificio — materiales, medidas, restricciones del terreno. Los Skills son el manual del albañil — como mezclar cemento, como levantar una pared. El albañil sabe hacer paredes en general, pero necesita el plano para saber donde ponerlas en TU edificio.

---

## Como Claude Code carga el contexto

```mermaid
flowchart LR
    A["CLAUDE.md global\n~/.claude/"] --> C["Contexto\ncombinado"]
    B["CLAUDE.md proyecto\nraiz del repo"] --> C
    C --> D{"Detecta\ncontexto"}
    D --> E["Carga Skill\nrelevante"]
    E --> F["Genera\ncodigo"]

    style A fill:#2563eb,stroke:#1e40af,color:#fff
    style B fill:#7c3aed,stroke:#5b21b6,color:#fff
    style C fill:#f59e0b,stroke:#d97706,color:#fff
    style D fill:#f59e0b,stroke:#d97706,color:#fff
    style E fill:#10b981,stroke:#059669,color:#fff
    style F fill:#10b981,stroke:#059669,color:#fff
```

Primero carga el CLAUDE.md global (tus preferencias personales), despues el del proyecto (reglas del equipo). Con ese contexto combinado, detecta que tipo de tarea estas pidiendo y carga el Skill que matchea. Recien ahi genera codigo — con TODAS las instrucciones aplicadas.

---

## CLAUDE.md — las reglas del proyecto

El CLAUDE.md es un archivo Markdown en la raiz del repo. Le dice a Claude Code todo lo que necesita saber sobre tu proyecto: que stack usas, que patrones seguir, que esta prohibido.

```markdown title="CLAUDE.md"
# Proyecto: Mi App Angular

## Stack
- Angular 19 con standalone components y signals
- NestJS 11 en backend
- PostgreSQL + Prisma ORM

## Reglas
- Siempre usar OnPush change detection
- No usar `any` — tipar todo
- Tests unitarios obligatorios para services
- Conventional commits en español

## Arquitectura
- Screaming architecture en frontend
- Hexagonal en backend
```

Cuanto mas especifico seas, mejor codigo vas a obtener. No es prosa — son reglas concretas que la IA puede seguir al pie de la letra.

:::info[Donde va el CLAUDE.md]
En la raiz del repositorio. Claude Code lo detecta automaticamente al abrir el proyecto. Tambien puede existir uno global en `~/.claude/CLAUDE.md` para preferencias personales que apliquen a todos tus repos.
:::

:::warning[No lo sobrecargues]
El CLAUDE.md se carga en contexto en CADA interaccion — siempre consume tokens. Si lo llenas con 500 lineas de reglas, estas quemando contexto valioso antes de que la IA lea una sola linea de tu codigo. Mantene el CLAUDE.md conciso y mové las reglas especificas de tecnologia a Skills, que solo se cargan cuando hacen falta.
:::

---

## Skills — expertise reutilizable

Un Skill es un archivo `SKILL.md` con instrucciones para un tipo de tarea específico: crear componentes Angular, configurar Docker, escribir tests con Vitest. Lo que le dice a Claude Code CUÁNDO cargarlo vive en el frontmatter, en el campo `description`.

```markdown title=".claude/skills/angular/SKILL.md"
---
name: angular
description: Angular moderno con standalone components y signals. Usar al crear o refactorizar componentes, servicios o routing en Angular.
---

# Angular — Standalone Components

- Siempre standalone: true (no NgModules)
- Signals para estado, no BehaviorSubject
- OnPush change detection obligatorio
- Smart/Dumb: containers manejan lógica, presentationals solo @Input/@Output
```

La diferencia con CLAUDE.md es que un Skill NO se carga siempre — solo cuando la tarea matchea su `description`. Si le pedís a Claude Code que escriba un Dockerfile, no necesita tus reglas de Angular. Cada Skill es expertise on-demand.

:::info[Donde viven los Skills]
En `~/.claude/skills/` (globales, para todos tus proyectos) o en `.claude/skills/` dentro del repo (compartidos con el equipo).
:::

### Precedencia: quién le gana a quién

Si un skill con el **mismo nombre** existe en varios niveles, el orden de prioridad (de mayor a menor) es:

1. **Empresa** (gestionados por la organización)
2. **Personal / global** (`~/.claude/skills/`)
3. **Proyecto** (`.claude/skills/` del repo)
4. **Bundled** (los que trae Claude Code de fábrica)

:::warning[Ojo — es al revés que en CLAUDE.md y settings.json]
En `settings.json` (y en CLAUDE.md) lo más específico gana: el proyecto pisa a lo global. **En Skills es al revés**: tu skill personal pisa al del proyecto. Si tenés un `deploy` en `~/.claude/skills/` y el repo trae otro `deploy` en `.claude/skills/`, se ejecuta el TUYO — el del equipo queda tapado. Tenelo presente si un skill del proyecto "no hace lo que dice el repo": probablemente tengas uno personal con el mismo nombre.
:::

---

## Anatomía de un Skill

Un `SKILL.md` tiene dos partes: el **frontmatter** (metadata en YAML) y el **cuerpo** (las instrucciones en Markdown).

```markdown title="SKILL.md"
---
name: docker
description: Buenas prácticas de Docker — multi-stage builds, imágenes livianas, security. Usar al crear Dockerfiles, docker-compose o al optimizar imágenes.
---

# Acá van las instrucciones que Claude sigue cuando carga el skill...
```

El campo `description` es **lo más importante de todo el archivo**. Es el único texto del skill que Claude ve siempre, y es lo que usa para decidir si el skill aplica a tu tarea. Si la descripción es vaga, el skill no se va a disparar cuando lo necesitás; si es precisa (qué hace + cuándo usarlo), Claude lo carga en el momento justo. El campo `name` es opcional — por defecto toma el nombre de la carpeta.

:::tip[Cómo se dispara la carga — progressive disclosure]
Claude **no** carga el cuerpo de todos tus skills de entrada. Mantiene en contexto solo las `description` de cada uno (baratas en tokens). Cuando tu pedido matchea una descripción, ahí recién carga el `SKILL.md` completo. Esto se llama *progressive disclosure*: pagás el costo de contexto solo por el skill que realmente usás.
:::

Un skill puede **empaquetar archivos de apoyo** en su carpeta — docs de referencia, templates, scripts — y referenciarlos desde el cuerpo del `SKILL.md`. Esos archivos NO se cargan solos: Claude los lee solo cuando el `SKILL.md` le indica que los necesita. Así un skill puede ser enorme en conocimiento sin pesar en contexto hasta que hace falta.

```
docker/
├── SKILL.md            # Puerta de entrada — frontmatter + instrucciones
├── multi-stage.md      # Referencia detallada (se carga on-demand)
└── scripts/
    └── scan-image.sh   # Script ejecutable que el skill puede invocar
```

---

## Skills vs otros mecanismos

Claude Code tiene varios mecanismos de extensión y es fácil confundirlos. Cada uno resuelve un problema distinto:

| Mecanismo | Qué es | Cuándo usarlo |
|---|---|---|
| **Skills** | Instrucciones reutilizables que Claude carga en contexto cuando la tarea matchea su `description` | Expertise repetible: "cómo hago X tipo de tarea" (componentes, tests, Dockerfiles) |
| **Subagents** | Un agente con contexto aislado, system prompt propio y herramientas acotadas | Tareas que conviene delegar a una ventana de contexto fresca (review, exploración, trabajo paralelo) |
| **MCP** | Conexión a herramientas y datos externos (APIs, bases de datos, servicios) | Darle a Claude *capacidades* nuevas: leer Jira, consultar una DB, llamar una API |
| **Slash commands** | Atajos que invocás manualmente con `/` | Disparar una acción puntual a pedido; hoy se apoyan en el mismo sistema de skills |

La distinción clave: **Skills son instrucciones** (el "cómo"), **MCP son capacidades** (el "con qué"), y **Subagents son contexto aislado** (el "dónde se ejecuta").

---

## CLAUDE.md vs Skills — cuando usar cada uno

| Caracteristica | CLAUDE.md | Skills |
|---|---|---|
| Scope | Un proyecto especifico | Reutilizable entre proyectos |
| Ubicacion | Raiz del repo | `~/.claude/skills/` o `.claude/skills/` |
| Se carga | Siempre, automaticamente | Solo cuando el contexto matchea el trigger |
| Contenido tipico | Stack, reglas, arquitectura, convenciones | Patrones de codigo, templates, reglas por tecnologia |
| Quien lo mantiene | El equipo del proyecto | El dev o el equipo (si esta en el repo) |
| Ejemplo | "Usar Prisma, no TypeORM" | "Como crear un service en NestJS" |

:::warning[No los mezcles]
El error mas comun es meter reglas de tecnologia especifica en el CLAUDE.md. Si una regla aplica a Angular en TODOS tus proyectos, va en un Skill. Si aplica solo a ESTE proyecto, va en CLAUDE.md. La regla es simple: si lo copiarias a otro repo, es un Skill.
:::

---

## La estructura recomendada

```
mi-proyecto/
├── CLAUDE.md                          # Reglas del proyecto
├── .claude/
│   └── skills/
│       └── mi-skill-custom/
│           └── SKILL.md               # Skill compartido con el equipo
├── src/
│   └── ...
└── ...

~/.claude/
├── CLAUDE.md                          # Preferencias personales (global)
└── skills/
    ├── angular/
    │   └── SKILL.md                   # Skill global — Angular
    ├── docker/
    │   └── SKILL.md                   # Skill global — Docker
    └── testing/
        └── SKILL.md                   # Skill global — Testing
```

Los skills globales son TUS herramientas personales. Los skills del proyecto se versionan con el repo y los comparte todo el equipo. Esto te permite tener un setup base que funciona en cualquier repo, y al mismo tiempo compartir convenciones especificas con tu equipo sin que cada uno tenga que configurar nada.

---

## El cuadro completo

CLAUDE.md y Skills son la primera capa del sistema. Definen la **calidad BASE** del codigo que genera la IA — antes de que intervenga ningun otro mecanismo.

Pero no trabajan solos. Los hooks validan localmente que el codigo cumpla las reglas. El CI valida en remoto que nada se rompa. Y SDD planifica antes de ejecutar para que los cambios grandes no sean un desastre.

Las cuatro capas juntas forman el sistema completo: **instrucciones → validacion local → validacion remota → planificacion**.

:::tip[Explora el catalogo]
Ya tenes el contexto de que son y cuando usar cada uno. Ahora anda a ver que hay disponible:
- **[Ver catalogo de Claude Skills →](../claude-skills/java-skill)** — skills listos para descargar e instalar
- **[Ver ejemplos de CLAUDE.md →](../claude-md/)** — templates de CLAUDE.md por stack
:::

:::tip[Conclusion]
CLAUDE.md es tu contrato con la IA para este proyecto. Los Skills son tu biblioteca de expertise. Configuralos bien y la IA va a generar codigo que ya cumple tus estandares ANTES de que lo revise ningun linter ni ningun hook. **Es la inversion con mayor retorno de todo el handbook.**
:::
