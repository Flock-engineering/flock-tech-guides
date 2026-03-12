---
id: docker-skill-raw
title: "SKILL.md — Docker"
sidebar_label: "SKILL.md"
---

# SKILL.md — Docker

Archivo de instrucciones que Claude usa internamente. Si encontrás algo para mejorar, abrí un PR directamente.

:::info Contribuir
[✏️ Sugerir corrección en GitHub](https://github.com/Flock-engineering/flock-tech-guides/edit/dev/static/skills/docker/SKILL.md) — GitHub te propone hacer fork y PR automáticamente si no tenés permisos de push.
:::

[⬇ Descargar SKILL.md](pathname:///flock-tech-guides/skills/docker/SKILL.md)

---

````md
---
name: docker
description: >
  Docker con multi-stage builds, Compose, seguridad y buenas prácticas.
  Trigger: crear Dockerfile, crear docker-compose, dockerizar aplicación, optimizar imagen Docker, agregar health check Docker
license: MIT
metadata:
  author: flock-engineering
  version: '1.0'
  scope: [root]
  auto_invoke:
    - 'Crear Dockerfile'
    - 'Crear docker-compose'
    - 'Dockerizar aplicación'
    - 'Optimizar imagen Docker'
    - 'Agregar health check Docker'
    - 'Configurar Docker para producción'
allowed-tools: Read, Edit, Write, Glob, Grep, Bash
---

# Docker Skill

## Critical Rules

### ALWAYS

- Usar **multi-stage builds** — separar build de runtime
- Correr el proceso como **usuario no-root** en producción
- Usar imágenes base **alpine** o **slim** para reducir superficie de ataque
- Fijar versiones exactas de imágenes: `node:20.11-alpine` no `node:latest`
- Agregar `.dockerignore` antes de cualquier `COPY`
- Usar `COPY` en lugar de `ADD` salvo que se necesite descomprimir un tar
- Ordenar layers de menos a más cambiante (dependencias antes que código)
- Agregar `HEALTHCHECK` en servicios web
- Usar variables de entorno para configuración — nunca hardcodear secrets
- Especificar `--chown` en `COPY` cuando se cambia de usuario

### NEVER

- Correr como `root` en producción
- Copiar `.git`, `node_modules`, `__pycache__` o `.env` a la imagen
- Usar `latest` como tag de imagen en producción
- Guardar secrets, contraseñas o tokens en el `Dockerfile` o en layers de imagen
- Instalar herramientas de debug (curl, wget, vim) en la imagen de producción
- Usar `--privileged` sin justificación documentada
- Combinar `RUN` commands innecesariamente si reduce la claridad

---

## Dockerfile Node.js (Multi-stage)

```dockerfile
# syntax=docker/dockerfile:1
# ---- Build stage ----
FROM node:20.11-alpine AS builder

WORKDIR /app

# Instalar dependencias primero (layer separada para cache)
COPY package*.json ./
RUN npm ci --frozen-lockfile

# Copiar fuente y compilar
COPY . .
RUN npm run build

# ---- Production stage ----
FROM node:20.11-alpine AS production

# Usuario no-root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Solo dependencias de producción
COPY package*.json ./
RUN npm ci --frozen-lockfile --omit=dev && npm cache clean --force

# Copiar artefactos del build (con ownership correcto)
COPY --from=builder --chown=appuser:appgroup /app/dist ./dist

USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "dist/main.js"]
```

---

## Dockerfile .NET (Multi-stage)

```dockerfile
# syntax=docker/dockerfile:1
# ---- Build stage ----
FROM mcr.microsoft.com/dotnet/sdk:8.0-alpine AS builder

WORKDIR /app

COPY *.csproj ./
RUN dotnet restore

COPY . .
RUN dotnet publish -c Release -o /publish --no-restore

# ---- Production stage ----
FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine AS production

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

COPY --from=builder --chown=appuser:appgroup /publish .

USER appuser

EXPOSE 8080

ENV ASPNETCORE_URLS=http://+:8080 \
    ASPNETCORE_ENVIRONMENT=Production

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:8080/health || exit 1

ENTRYPOINT ["dotnet", "MyApp.dll"]
```

---

## Dockerfile Python (Multi-stage)

```dockerfile
# syntax=docker/dockerfile:1
# ---- Build stage ----
FROM python:3.12-slim AS builder

WORKDIR /app

RUN pip install --no-cache-dir uv

COPY requirements.txt .
RUN uv pip install --no-cache --system -r requirements.txt

# ---- Production stage ----
FROM python:3.12-slim AS production

RUN groupadd -r appgroup && useradd -r -g appgroup appuser

WORKDIR /app

COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --chown=appuser:appgroup . .

USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## .dockerignore

```dockerignore
# Control de versiones
.git
.gitignore

# Dependencias (se instalan dentro del container)
node_modules
__pycache__
*.pyc
.venv
vendor

# Variables de entorno y secrets
.env
.env.*
*.pem
*.key

# Build artifacts locales
dist
build
.next
out

# Herramientas de desarrollo
.vscode
.idea
*.log
coverage
.nyc_output

# Docker files (no incluirse a sí mismos)
Dockerfile*
docker-compose*.yml
.dockerignore

# Tests
**/*.test.ts
**/*.spec.ts
tests/
__tests__/
```

---

## docker-compose.yml (Desarrollo)

```yaml
name: myapp

services:
  api:
    build:
      context: .
      target: builder          # usa el stage de build para dev (hot-reload)
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: development
      DATABASE_URL: postgresql://postgres:postgres@db:5432/myapp_dev
      REDIS_URL: redis://redis:6379
    volumes:
      - .:/app                 # mount de código para hot-reload
      - /app/node_modules      # evita sobreescribir node_modules del container
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    command: npm run start:dev

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER:     postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB:       myapp_dev
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 3

volumes:
  postgres_data:
```

---

## docker-compose.prod.yml (Producción)

```yaml
name: myapp-prod

services:
  api:
    image: myapp:${IMAGE_TAG:-latest}
    restart: unless-stopped
    environment:
      NODE_ENV: production
      DATABASE_URL: ${DATABASE_URL}
    secrets:
      - jwt_secret
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 15s

  db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER:     ${DB_USER}
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    secrets:
      - db_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

secrets:
  jwt_secret:
    external: true
  db_password:
    external: true

volumes:
  postgres_data:
```

---

## Commands

```bash
# Build
docker build -t myapp:latest .
docker build --target production -t myapp:prod .

# Run
docker run -d -p 3000:3000 --name myapp myapp:latest
docker run --rm -it myapp:latest sh   # shell interactivo

# Compose
docker compose up -d                  # levantar en background
docker compose up --build             # rebuild + up
docker compose down -v                # bajar + borrar volúmenes
docker compose logs -f api            # logs en tiempo real

# Debug
docker compose exec api sh            # shell en container corriendo
docker inspect myapp                  # metadata del container
docker stats                          # CPU/mem en tiempo real

# Limpiar
docker system prune -f                # eliminar recursos no usados
docker image prune -a -f              # eliminar imágenes no usadas
docker volume prune -f                # eliminar volúmenes no usados

# Análisis de imagen
docker scout quickview myapp:latest   # vulnerabilidades
dive myapp:latest                     # análisis de layers
```
````
