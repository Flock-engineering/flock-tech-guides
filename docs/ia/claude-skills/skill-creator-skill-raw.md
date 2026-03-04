---
id: skill-creator-skill-raw
title: "SKILL.md — Skill Creator"
sidebar_label: "SKILL.md"
---

# SKILL.md — Skill Creator

Archivo de instrucciones que Claude usa internamente. Si encontrás algo para mejorar, abrí un PR directamente.

:::info Contribuir
[✏️ Sugerir corrección en GitHub](https://github.com/Flock-engineering/flock-tech-guides/edit/dev/static/skills/skill-creator/SKILL.md) — GitHub te propone hacer fork y PR automáticamente si no tenés permisos de push.
:::

[⬇ Descargar SKILL.md](/flock-tech-guides/skills/skill-creator/SKILL.md)

---

````md
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
````
