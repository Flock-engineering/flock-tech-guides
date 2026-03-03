---
name: skill-creator
description: >
  Meta-skill para crear nuevas skills.
  Trigger: crear nueva skill, agregar skill al proyecto
license: MIT
metadata:
  author: nomadear
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
  scope: [root] # o [root, auth, events]
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

| Scope    | AGENTS.md Afectado      |
| -------- | ----------------------- |
| `root`   | `/AGENTS.md`            |
| `auth`   | `/src/auth/AGENTS.md`   |
| `events` | `/src/events/AGENTS.md` |

Una skill puede tener múltiples scopes:

```yaml
scope: [root, auth, events]
```

---

## Convenciones de Naming

- **Skills genéricas**: nombre de tecnología (ej: `nestjs`, `prisma`)
- **Skills del proyecto**: prefijo `nomadear-` (ej: `nomadear-auth`)
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
