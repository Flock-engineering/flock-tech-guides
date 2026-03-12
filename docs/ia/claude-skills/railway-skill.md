---
id: railway-skill
title: "Claude Skill: Railway Deploy"
sidebar_label: "Railway Skill"
---

# Claude Skill: Railway Deploy

Skill que guía a Claude para hacer deploys en Railway de forma **segura y validada** — con máxima protección contra borrado de datos, deploys en entornos incorrectos y secrets expuestos.

:::tip Descarga el skill
<a href="/flock-tech-guides/skills/railway/SKILL.md" download="SKILL.md">⬇ Descargar SKILL.md</a> — guardalo en `~/.claude/skills/railway/SKILL.md` para instalarlo directamente.
:::

## ¿Qué hace?

Cuando Claude ejecuta operaciones en Railway, este skill le impone:

- **Verificación obligatoria** con `railway status` antes de cualquier acción
- **Confirmación explícita** antes de `railway up`, `railway delete` y `railway rollback`
- **Doble confirmación** para acciones en `production`
- **Protocolo de borrado** con confirmación por nombre para `railway delete`
- Validación de variables de entorno antes de deployar
- Verificación de logs post-deploy
- Checklist pre y post deploy

## ¿Cuándo se activa?

Claude lo invoca automáticamente al detectar:

> *"deployar en railway"*, *"railway up"*, *"railway deploy"*, *"configurar railway"*, *"variables railway"*, *"rollback railway"*, *"railway delete"*

## Reglas de seguridad

| Acción | Protección |
|---|---|
| `railway up` | Muestra proyecto + entorno + servicio, pide confirmación |
| `railway up` en `production` | Doble confirmación — el usuario debe escribir "confirmo" |
| `railway delete` | Irreversible — pide escribir el nombre exacto del servicio |
| `railway rollback` | Muestra deploy actual vs. target antes de ejecutar |
| `railway variables` | No loguea valores completos de secrets |

## Flujo de Deploy

```
1. railway status          → verificar proyecto, entorno, servicio
2. Mostrar resumen         → el usuario confirma
3. railway variables       → validar que existen las variables requeridas
4. railway up              → deploy
5. railway logs --tail 50  → verificar que levantó sin errores
```

## Checklist Pre-Deploy

- [ ] Proyecto y entorno correctos (`railway status`)
- [ ] Servicio destino verificado
- [ ] Variables de entorno configuradas
- [ ] Sin secrets hardcodeados en el código
- [ ] Tests pasaron antes de deployar a `production`

## Checklist Post-Deploy

- [ ] Logs sin errores de inicio
- [ ] Servicio responde correctamente
- [ ] Migraciones de BD aplicadas (si aplica)
- [ ] Deploy documentado en el ticket/PR

## Manejo de Entornos

| Entorno | Rama | Deploy | Confirmación |
|---|---|---|---|
| `production` | `main` | Manual | Doble (escribir "confirmo") |
| `staging` | `dev` | Auto o manual | Simple |
| `dev` | feature branches | Solo pruebas | Simple |

## Errores más comunes

| Error | Causa | Acción |
|---|---|---|
| `Build failed` | Error de compilación | Revisar `railway logs` antes de reintentar |
| `Port not exposed` | Falta variable `PORT` | Agregar `PORT=3000` en variables |
| `Database connection failed` | `DATABASE_URL` incorrecta | Verificar variable y BD |

## Instalación rápida

1. Descargá el `SKILL.md` con el botón de arriba
2. Abrí Claude Code en tu terminal
3. Adjuntá el archivo y enviá:

> *"Instalá este skill en `~/.claude/skills/railway/SKILL.md`"*

## Nivel de aplicación

**Tipo:** Automático por inferencia | **Nivel:** Crítico — alta protección ante acciones irreversibles
