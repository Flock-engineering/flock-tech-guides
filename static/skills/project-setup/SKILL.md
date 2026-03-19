---
name: project-setup
description: >
  Levanta proyectos de forma segura: lee el README, valida dependencias, versiones,
  variables de entorno, esquemas de base de datos y estado general antes de arrancar.
  Trigger: levantar proyecto, configurar proyecto, setup proyecto, arrancar proyecto, onboarding proyecto
license: MIT
metadata:
  author: flock-engineering
  version: '1.0'
  scope: [root]
  auto_invoke:
    - 'levantar proyecto'
    - 'setup proyecto'
    - 'configurar proyecto'
    - 'arrancar proyecto'
    - 'onboarding proyecto'
    - 'project setup'
    - 'inicializar proyecto'
allowed-tools: Read, Glob, Grep, Bash
---

# Project Setup Skill

## Critical Rules

### ALWAYS

- Leer `README.md` primero — entender el proyecto antes de ejecutar cualquier cosa
- Reportar cada validación con estado visual: 🟢 OK / 🟡 advertencia / 🔴 error
- Mostrar resumen final con todos los estados antes de sugerir el siguiente paso
- Verificar que el entorno requerido (Node, Java, Python, .NET, etc.) esté instalado y en la versión correcta
- Comparar `.env.example` contra `.env` — reportar variables faltantes sin exponer valores
- Validar migraciones pendientes antes de levantar el servidor
- Proponer actualizaciones de dependencias outdated, nunca aplicarlas sin confirmación
- Actualizar el README si encontrás información desactualizada o faltante
- Ejecutar el health check del proyecto al final si está disponible

### NEVER

- Ejecutar migraciones sin confirmación explícita del usuario
- Modificar `.env` directamente — solo reportar lo que falta
- Instalar o actualizar dependencias sin mostrar qué se va a cambiar
- Asumir que el proyecto está listo — siempre validar desde cero
- Exponer valores de variables de entorno en el output
- Ignorar errores de validación y continuar el setup

---

## Protocolo de Setup

### Fase 1 — Reconocimiento del Proyecto

```bash
# 1. Leer README
cat README.md

# 2. Identificar tipo de proyecto
ls package.json pom.xml *.csproj requirements.txt pyproject.toml 2>/dev/null

# 3. Ver estructura general
ls -la
```

**Extraer del README:**
- Stack tecnológico y versiones requeridas
- Pasos de instalación
- Variables de entorno necesarias
- Comandos de setup y de arranque
- Dependencias externas (BD, servicios, APIs)

---

### Fase 2 — Validación de Entorno

#### Node.js / npm

```bash
node --version   # Comparar con .nvmrc o engines en package.json
npm --version
cat .nvmrc 2>/dev/null || cat package.json | grep '"node"'
```

#### Java

```bash
java --version   # Comparar con pom.xml <java.version> o build.gradle
mvn --version 2>/dev/null || gradle --version 2>/dev/null
```

#### .NET

```bash
dotnet --version   # Comparar con <TargetFramework> en .csproj
```

#### Python

```bash
python --version 2>/dev/null || python3 --version
cat .python-version 2>/dev/null || cat pyproject.toml | grep python
```

---

### Fase 3 — Validación de Dependencias

#### Node.js

```bash
# Verificar que node_modules existe
ls node_modules > /dev/null 2>&1 || echo "🔴 node_modules ausente — correr npm install"

# Detectar dependencias outdated (sin instalar nada)
npm outdated 2>/dev/null

# Detectar vulnerabilidades de seguridad
npm audit --audit-level=high 2>/dev/null
```

#### Java (Maven)

```bash
# Verificar dependencias declaradas vs resueltas
mvn dependency:resolve -q 2>/dev/null | grep -i "missing\|error" || echo "🟢 Dependencias OK"

# Detectar updates disponibles
mvn versions:display-dependency-updates -q 2>/dev/null | head -30
```

#### Python

```bash
# Verificar requirements instalados
pip list --outdated 2>/dev/null | head -20

# Verificar que el venv esté activo si existe
ls .venv venv env 2>/dev/null
```

---

### Fase 4 — Variables de Entorno

```bash
# Comparar .env.example con .env
diff <(grep -v '^#' .env.example | grep '=' | cut -d= -f1 | sort) \
     <(grep -v '^#' .env         | grep '=' | cut -d= -f1 | sort) 2>/dev/null
```

**Reportar:**
- 🔴 Variables en `.env.example` que no están en `.env` (bloqueantes)
- 🟡 Variables en `.env` que no están en `.env.example` (posible documentación faltante)
- 🟢 Todas las variables cubiertas

**Si no existe `.env`:**
```bash
cp .env.example .env
echo "🟡 Creé .env desde .env.example — completá los valores reales antes de continuar"
```

---

### Fase 5 — Esquema de Base de Datos

#### Prisma

```bash
# Migraciones pendientes
npx prisma migrate status 2>/dev/null

# Validar schema vs BD
npx prisma validate 2>/dev/null
```

#### Flyway / Liquibase (Java)

```bash
mvn flyway:info 2>/dev/null | grep -E "Pending|Failed"
```

#### Django / Alembic (Python)

```bash
python manage.py showmigrations --plan 2>/dev/null | grep '\[ \]' | head -10
alembic current 2>/dev/null
```

#### Rails / Sequel

```bash
rails db:migrate:status 2>/dev/null | grep down | head -10
```

**Si hay migraciones pendientes:**
> 🟡 Encontré N migraciones pendientes. ¿Querés que las ejecute?
> Mostrá la lista antes de confirmar.

---

### Fase 6 — Linting y Calidad

```bash
# Node.js
npm run lint --silent 2>/dev/null | head -20

# .NET
dotnet format --verify-no-changes 2>/dev/null | head -10

# Python
flake8 . --count --statistics 2>/dev/null | tail -5
```

---

### Fase 7 — Tests (opcional, con confirmación)

Antes de correr tests, preguntar al usuario:
> ¿Querés que ejecute el suite de tests para validar el estado del proyecto?

```bash
# Node.js
npm test -- --passWithNoTests 2>/dev/null

# Java
mvn test -q 2>/dev/null

# Python
pytest --tb=short -q 2>/dev/null

# .NET
dotnet test --no-build --verbosity quiet 2>/dev/null
```

---

### Fase 8 — Arranque del Servidor

Solo ejecutar si todas las fases anteriores están 🟢 o 🟡 (sin 🔴 bloqueantes):

```bash
# Ver el comando de arranque en package.json / README
cat package.json | grep '"dev"\|"start"\|"serve"'
```

> Mostrá el comando al usuario antes de ejecutarlo. No arrancar automáticamente en producción.

---

## Resumen de Validación

Al finalizar todas las fases, mostrar un resumen:

```
📋 Estado del Proyecto: <nombre>

🟢 Entorno:       Node 20.x ✓
🟢 Dependencias:  Instaladas ✓
🟡 Librerías:     3 outdated (no críticas)
🔴 Variables:     DB_PASSWORD faltante en .env
🟢 BD:            Sin migraciones pendientes
🟢 Linting:       Sin errores
🟡 Tests:         No ejecutados

Próximo paso: Completá DB_PASSWORD en .env y volvé a validar.
```

---

## Actualización del README

Si durante el setup encontrás información desactualizada o faltante en el README, proponer:

- Versiones de runtime desactualizadas
- Pasos de instalación incompletos
- Variables de entorno no documentadas
- Servicios externos no mencionados
- Comandos útiles faltantes (migraciones, seeds, tests)

> Mostrar el diff propuesto al usuario antes de aplicarlo.

---

## Otras Validaciones Útiles (según el proyecto)

| Validación | Cuándo aplicar |
|---|---|
| `docker-compose up --dry-run` | Si hay `docker-compose.yml` |
| Chequear puertos en uso | Si el puerto del servidor está ocupado |
| Verificar conexión a servicios externos | APIs, Redis, S3, etc. mencionados en el README |
| Validar certificados SSL | Si el proyecto usa HTTPS en local |
| Revisar seeds / datos iniciales | Si el README menciona datos de prueba |
| Verificar rate limits de APIs externas | Si se usan APIs con cuota |
