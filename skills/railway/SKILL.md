---
name: railway
description: >
  Deploys seguros en Railway: siempre valida proyecto, entorno y servicio antes de ejecutar.
  Máxima protección contra borrado de datos y deploys en entornos incorrectos.
  Trigger: deployar en railway, railway up, railway deploy, configurar railway, variables railway
license: MIT
metadata:
  author: flock-engineering
  version: '1.0'
  scope: [root]
  auto_invoke:
    - 'deployar en railway'
    - 'railway up'
    - 'railway deploy'
    - 'configurar railway'
    - 'variables railway'
    - 'rollback railway'
    - 'railway delete'
    - 'eliminar servicio railway'
allowed-tools: Read, Bash, Glob, Grep
---

# Railway Skill

## ⚠️ Regla de Oro

**NUNCA ejecutar ninguna acción en Railway sin antes mostrar al usuario:**
- Proyecto activo
- Entorno activo (`production` / `staging` / `dev`)
- Servicio destino

Y recibir **confirmación explícita**.

---

## Critical Rules

### ALWAYS

- Ejecutar `railway status` como primer paso de cualquier operación
- Mostrar resumen completo (proyecto, entorno, servicio) antes de cualquier acción
- Pedir confirmación explícita antes de `railway up`, `railway delete`, `railway rollback`
- Doble confirmación para acciones en `production`
- Usar variables de entorno para secrets — nunca hardcodear
- Verificar que las variables requeridas existen con `railway variables` antes del deploy
- Hacer `railway logs` después de un deploy para verificar que levantó correctamente
- Documentar cualquier variable nueva que se agregue

### NEVER

- Ejecutar `railway up` sin confirmar entorno y servicio destino
- Ejecutar `railway delete` sin confirmación explícita del usuario (acción irreversible)
- Hardcodear API keys, passwords, tokens o secrets en el código o en el deploy
- Asumir que el entorno activo es el correcto — siempre verificar con `railway status`
- Hacer rollback sin verificar el estado actual y el motivo
- Compartir o loguear el output de `railway variables` si contiene secrets
- Cambiar variables en `production` sin notificar al equipo

---

## Flujo Obligatorio de Deploy

### 1 — Verificar estado

```bash
railway status
```

Confirmar con el usuario:
```
Proyecto : <nombre>
Entorno  : <production | staging | dev>
Servicio : <nombre>
Branch   : <rama>

¿Confirmar deploy en este entorno y servicio? (sí/no)
```

### 2 — Si el entorno es `production` → doble confirmación

```
⚠️  Estás a punto de deployar en PRODUCTION.
Proyecto : <nombre>
Servicio : <nombre>

Escribí "confirmo" para continuar.
```

### 3 — Validar variables antes de deployar

```bash
railway variables
```

Verificar que las variables críticas existen (no mostrar los valores completos).

### 4 — Deploy

```bash
railway up
```

### 5 — Verificar logs post-deploy

```bash
railway logs --tail 50
```

Confirmar que el servicio levantó sin errores.

---

## Flujo Obligatorio para `railway delete`

`railway delete` es **irreversible**. Protocolo estricto:

```
🔴 ACCIÓN IRREVERSIBLE: railway delete
Esto eliminará permanentemente:
  - Servicio : <nombre>
  - Proyecto : <nombre>
  - Entorno  : <nombre>
  - Todos los datos asociados

¿Estás seguro? Esta acción NO se puede deshacer.
Escribí el nombre del servicio para confirmar: <nombre>
```

Solo ejecutar si el usuario escribe exactamente el nombre del servicio.

---

## Flujo de Rollback

```bash
# Ver deploys anteriores
railway deployments

# Rollback a deploy específico
railway rollback <deployment-id>
```

Antes del rollback, mostrar:
```
Rollback:
  Desde : <deployment-id-actual> (<fecha>)
  Hacia : <deployment-id-target> (<fecha>)
  Entorno: <nombre>

¿Confirmar rollback? Esto reemplaza el deploy activo.
```

---

## Comandos de Referencia

```bash
# Estado actual — siempre el primer paso
railway status

# Cambiar de proyecto
railway link

# Listar y cambiar entorno
railway environment

# Ver y editar variables
railway variables
railway variables set KEY=VALUE
railway variables delete KEY

# Deploy
railway up                    # Deploy del directorio actual
railway up --detach           # Deploy sin esperar output

# Logs
railway logs                  # Logs en tiempo real
railway logs --tail 100       # Últimas 100 líneas

# Deploys anteriores
railway deployments

# Rollback
railway rollback <id>

# Abrir dashboard en el navegador
railway open

# Eliminar (irreversible — ver protocolo arriba)
railway delete
```

---

## Variables de Entorno — Buenas Prácticas

```bash
# ✅ BIEN — usar variables de entorno
DATABASE_URL=${{Postgres.DATABASE_URL}}
API_KEY=${{shared.API_KEY}}

# ❌ MAL — hardcodear secrets
DATABASE_URL=postgresql://user:pass@host:5432/db
API_KEY=sk-xxxxxxxxxxxxx
```

### Variables por entorno

| Variable        | Production       | Staging          |
|-----------------|------------------|------------------|
| `NODE_ENV`      | `production`     | `staging`        |
| `LOG_LEVEL`     | `warn`           | `debug`          |
| `DATABASE_URL`  | BD prod (aislada) | BD staging       |

**Regla:** las BDs de `production` y `staging` deben ser instancias completamente separadas.

---

## Checklist Pre-Deploy

Antes de confirmar cualquier deploy:

- [ ] `railway status` muestra el proyecto correcto
- [ ] El entorno es el esperado (`staging` para pruebas, `production` solo con confirmación)
- [ ] El servicio destino es el correcto
- [ ] Las variables de entorno requeridas están configuradas
- [ ] No hay secrets hardcodeados en el código
- [ ] Los tests pasaron antes de deployar a `production`
- [ ] Se notificó al equipo si es un deploy a `production`

---

## Checklist Post-Deploy

Después de cada deploy:

- [ ] `railway logs` no muestra errores de inicio
- [ ] El servicio responde (health check o endpoint de prueba)
- [ ] Las migraciones de BD corrieron correctamente (si aplica)
- [ ] El deploy se documentó en el ticket/PR correspondiente

---

## Ambientes Recomendados

```
production  → rama main   → deploy manual con confirmación doble
staging     → rama dev    → deploy automático o manual con confirmación simple
dev         → feature branches → solo para pruebas locales o CI
```

---

## Errores Comunes

| Error | Causa probable | Acción |
|---|---|---|
| `Build failed` | Error de compilación | Ver `railway logs` — nunca reintentar sin revisar |
| `Port not exposed` | Variable `PORT` no configurada | Agregar `PORT=3000` en variables |
| `Database connection failed` | `DATABASE_URL` incorrecta o BD caída | Verificar variable y estado de la BD |
| `Out of memory` | Servicio sin suficiente RAM | Revisar plan en dashboard |
| `Deploy timeout` | Build muy lento | Optimizar Dockerfile o agregar `.dockerignore` |
