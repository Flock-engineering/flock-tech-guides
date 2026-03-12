---
id: github-actions-skill
title: "Claude Skill: GitHub Actions"
sidebar_label: "GitHub Actions Skill"
---

# Claude Skill: GitHub Actions

Skill que guía a Claude para escribir workflows de CI/CD con permisos mínimos, caching de dependencias, secrets correctos y separación entre pipelines de integración y deploy.

:::tip Descarga el skill
<a href="/flock-tech-guides/skills/github-actions/SKILL.md" download="SKILL.md">⬇ Descargar SKILL.md</a> — guardalo en `~/.claude/skills/github-actions/SKILL.md` para instalarlo directamente.
:::

## ¿Qué hace?

Cuando Claude crea o revisa workflows de GitHub Actions, este skill le indica:

- Fijar versiones de actions con SHA o tag: `actions/checkout@v4`
- Usar **secrets** para credenciales — nunca hardcodear tokens
- Agregar **timeouts** a todos los jobs para evitar runs colgados
- Usar **caching** de dependencias para reducir tiempos de build
- Definir **permisos mínimos** con `permissions:` explícito
- Agregar `concurrency:` para cancelar runs anteriores del mismo branch
- Separar workflows: CI (test/lint/build) vs CD (deploy)
- Usar **environments** de GitHub para deployments con aprobaciones

## ¿Cuándo se activa?

Claude lo invoca automáticamente al detectar:

> *"Crear workflow GitHub Actions"*, *"Agregar CI/CD"*, *"Configurar pipeline"*, *"Agregar job GitHub Actions"*, *"Cache GitHub Actions"*, *"Configurar secrets Actions"*

## Reglas de calidad

| Regla | Descripción |
|---|---|
| **Sin hardcoded secrets** | Usar `${{ secrets.NAME }}` siempre |
| **Timeout en cada job** | `timeout-minutes:` para evitar runs colgados |
| **Permisos mínimos** | `permissions: contents: read` como base |
| **`concurrency` en PRs** | Cancelar runs anteriores del mismo branch |
| **Sin `pull_request_target` con código fork** | Riesgo de ejecución de código no confiable |
| **CI y CD separados** | Workflows distintos para integración y deploy |

## Workflow CI Node.js

```yaml
name: CI
on:
  push:    { branches: [main, dev] }
  pull_request: { branches: [main, dev] }

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

permissions:
  contents: read

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci --frozen-lockfile
      - run: npm run lint
      - run: npx tsc --noEmit
      - run: npm run test:cov
```

## Deploy con SSH y Docker

```yaml
- name: Deploy via SSH
  uses: appleboy/ssh-action@v1
  with:
    host:     ${{ secrets.DEPLOY_HOST }}
    username: ${{ secrets.DEPLOY_USER }}
    key:      ${{ secrets.DEPLOY_SSH_KEY }}
    script: |
      cd /opt/myapp
      export IMAGE_TAG=${{ github.sha }}
      docker compose -f docker-compose.prod.yml pull
      docker compose -f docker-compose.prod.yml up -d --no-build
```

## Instalación rápida

1. Descargá el `SKILL.md` con el botón de arriba
2. Abrí Claude Code en tu terminal
3. Adjuntá el archivo y enviá:

> *"Instalá este skill en `~/.claude/skills/github-actions/SKILL.md`"*

## Nivel de aplicación

**Tipo:** Automático por inferencia | **Nivel:** Avanzado
