---
id: docker-skill
title: "Claude Skill: Docker"
sidebar_label: "Docker Skill"
---

# Claude Skill: Docker

Skill que guía a Claude para escribir Dockerfiles con multi-stage builds, usuario no-root, imágenes mínimas y configuraciones de Compose para desarrollo y producción.

:::tip Descarga el skill
<a href="/flock-tech-guides/skills/docker/SKILL.md" download="SKILL.md">⬇ Descargar SKILL.md</a> — guardalo en `~/.claude/skills/docker/SKILL.md` para instalarlo directamente.
:::

## ¿Qué hace?

Cuando Claude crea o revisa configuraciones Docker, este skill le indica:

- Usar **multi-stage builds** — separar build stage de runtime stage
- Correr el proceso como **usuario no-root** en producción
- Usar imágenes base **alpine** o **slim** para reducir superficie de ataque
- Fijar versiones exactas: `node:20.11-alpine` nunca `node:latest`
- Agregar `.dockerignore` antes de cualquier `COPY`
- Ordenar layers de menos a más cambiante (dependencias antes que código)
- Agregar `HEALTHCHECK` en servicios web
- Usar secrets de Docker Compose en producción — nunca hardcodear credentials

## ¿Cuándo se activa?

Claude lo invoca automáticamente al detectar:

> *"Crear Dockerfile"*, *"Crear docker-compose"*, *"Dockerizar aplicación"*, *"Optimizar imagen Docker"*, *"Agregar health check Docker"*, *"Configurar Docker para producción"*

## Reglas de calidad

| Regla | Descripción |
|---|---|
| **Sin `root` en producción** | Crear usuario con `adduser`/`useradd` y usar `USER` |
| **Sin `latest` en producción** | Fijar versión exacta de imagen |
| **Sin secrets en layers** | Usar build secrets o variables de entorno en runtime |
| **Multi-stage obligatorio** | Build y runtime siempre en stages separados |
| **`.dockerignore` siempre** | Excluir `.git`, `node_modules`, `.env` y artifacts locales |
| **`HEALTHCHECK` en web services** | Definir intervalo, timeout y reintentos |

## Dockerfile Node.js multi-stage

```dockerfile
FROM node:20.11-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --frozen-lockfile
COPY . .
RUN npm run build

FROM node:20.11-alpine AS production
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
COPY package*.json ./
RUN npm ci --frozen-lockfile --omit=dev && npm cache clean --force
COPY --from=builder --chown=appuser:appgroup /app/dist ./dist
USER appuser
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["node", "dist/main.js"]
```

## docker-compose.yml para desarrollo

```yaml
services:
  api:
    build: { context: ., target: builder }
    ports: ["3000:3000"]
    volumes:
      - .:/app
      - /app/node_modules
    depends_on:
      db: { condition: service_healthy }

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: myapp_dev
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
```

## Instalación rápida

1. Descargá el `SKILL.md` con el botón de arriba
2. Abrí Claude Code en tu terminal
3. Adjuntá el archivo y enviá:

> *"Instalá este skill en `~/.claude/skills/docker/SKILL.md`"*

## Nivel de aplicación

**Tipo:** Automático por inferencia | **Nivel:** Avanzado
