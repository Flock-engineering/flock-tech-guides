---
name: skill-creator
description: >
  Meta-skill para crear nuevas skills.
  Trigger: crear nueva skill, agregar skill al proyecto
license: MIT
metadata:
  author: tu-proyecto
  version: '1.0'
  scope: [root]
  auto_invoke:
    - 'Crear nueva skill'
    - 'Agregar skill'
allowed-tools: Read, Edit, Write, Glob, Grep, Bash
---

# Skill Creator

## Pasos para Crear una Skill

### 1. Crear Carpeta

```bash
mkdir skills/{skill-name}
```

### 2. Crear SKILL.md

```bash
touch skills/{skill-name}/SKILL.md
```

### 3. Estructura del Archivo

```markdown
---
name: skill-name
description: >
  Descripción de la skill.
  Trigger: cuándo usar esta skill
license: MIT
metadata:
  author: nomadear
  version: '1.0'
  scope: [root] # o [root, modulo1, modulo2]
  auto_invoke:
    - 'Acción que activa la skill'
    - 'Otra acción'
allowed-tools: Read, Edit, Write, Glob, Grep, Bash
---

# Skill Name

## Critical Rules

### ALWAYS

- Regla 1
- Regla 2

### NEVER

- Anti-patrón 1
- Anti-patrón 2

---

## Patterns

### Pattern Name

\`\`\`typescript
// Código de ejemplo
\`\`\`

---

## Commands

\`\`\`bash

# Comandos útiles

\`\`\`

---

## Project-Specific Notes

Notas específicas del proyecto...
```

### 4. Sincronizar Auto-invoke

```bash
./skills/skill-sync.sh
```

Esto actualiza automáticamente las tablas de auto-invoke en AGENTS.md.

---

## Scopes Disponibles

| Scope      | AGENTS.md Afectado           |
| ---------- | ---------------------------- |
| `root`     | `/AGENTS.md`                 |
| `[módulo]` | `/src/[módulo]/AGENTS.md`    |

Una skill puede tener múltiples scopes:

```yaml
scope: [root, auth, users]
```

> Definí los scopes según la estructura de carpetas de tu proyecto.

---

## Convenciones de Naming

- **Skills genéricas**: nombre de tecnología (ej: `nestjs`, `prisma`)
- **Skills del proyecto**: prefijo con nombre del proyecto (ej: `mi-proyecto-auth`)
- **Skills meta**: nombre descriptivo (ej: `commit`, `skill-creator`)

---

## Checklist

- [ ] Carpeta creada en `skills/`
- [ ] SKILL.md con metadata YAML válida
- [ ] Secciones: Critical Rules, Patterns, Commands
- [ ] Scope definido correctamente
- [ ] auto_invoke con acciones claras
- [ ] Ejecutar `./skills/skill-sync.sh`
- [ ] Verificar que aparece en AGENTS.md

---

## Agregar Assets (Opcional)

Si la skill necesita templates o ejemplos:

```
skills/{skill-name}/
├── SKILL.md
├── assets/
│   ├── template.ts
│   └── example.json
└── references/
    └── docs-link.md
```

Referenciar en SKILL.md:

```markdown
## Resources

- Template: [assets/template.ts](assets/template.ts)
- Docs: [references/docs-link.md](references/docs-link.md)
```

---

## Proceso de Discovery (Anthropic)

Antes de escribir el SKILL.md, capturar la intención con estas preguntas:

1. ¿Qué debería habilitar esta skill en Claude?
2. ¿Cuándo debería activarse? (frases de usuario, contextos)
3. ¿Cuál es el formato de output esperado?
4. ¿Necesita test cases verificables? (los skills con outputs objetivos se benefician de ellos)

### Entrevista y Research

- Preguntar sobre edge cases, formatos de entrada/salida, archivos de ejemplo y criterios de éxito
- Verificar MCPs disponibles para research en paralelo si ayuda
- No escribir test prompts hasta tener esto claro

---

## Anatomía de una Skill (Referencia Anthropic)

```
skill-name/
├── SKILL.md (requerido)
│   ├── YAML frontmatter (name, description requeridos)
│   └── Instrucciones en Markdown
└── Recursos Bundleados (opcional)
    ├── scripts/    — Código ejecutable para tareas determinísticas/repetitivas
    ├── references/ — Docs que se cargan en contexto según necesidad
    └── assets/     — Archivos usados en el output (templates, íconos, fuentes)
```

### Sistema de Carga Progresiva

1. **Metadata** (name + description) — Siempre en contexto (~100 palabras)
2. **SKILL.md body** — En contexto cuando el skill se activa (<500 líneas ideal)
3. **Recursos bundleados** — Según necesidad (sin límite, los scripts pueden ejecutarse sin cargar)

**Reglas:**
- Mantener SKILL.md bajo 500 líneas; si se acerca al límite, agregar jerarquía adicional con punteros claros
- Para múltiples dominios, organizar por variante con un archivo de referencia por cada una
- Para archivos de referencia grandes (>300 líneas), incluir tabla de contenidos

---

## Descripción del Skill — Optimización de Triggering

La descripción es el **mecanismo principal de activación**. Debe incluir:
- Qué hace el skill
- En qué contextos específicos usarlo

**Anti-patrón**: descripción pasiva que hace que Claude "undertrigger" (no active el skill cuando debería).

**Patrón correcto**: ser un poco "pushier" en la descripción. En lugar de:
> "Cómo construir un dashboard simple para datos internos."

Preferir:
> "Cómo construir un dashboard simple para datos internos. Usar este skill cuando el usuario menciona dashboards, visualización de datos, métricas internas, o quiere mostrar cualquier tipo de datos, incluso si no pide explícitamente un 'dashboard'."

---

## Estilo de Escritura de Skills

- Usar forma imperativa en las instrucciones
- Explicar el POR QUÉ de las reglas en lugar de solo el MUST
- Generalizar desde los ejemplos — las skills se usan millones de veces, no solo en los casos de test
- Mantener el prompt liviano — quitar lo que no agrega valor
- Revisar las transcripciones de ejecución, no solo los outputs finales
