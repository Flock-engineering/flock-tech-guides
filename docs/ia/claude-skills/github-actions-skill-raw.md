---
id: github-actions-skill-raw
title: "SKILL.md — GitHub Actions"
sidebar_label: "SKILL.md"
---

# SKILL.md — GitHub Actions

Archivo de instrucciones que Claude usa internamente. Si encontrás algo para mejorar, abrí un PR directamente.

:::info Contribuir
[✏️ Sugerir corrección en GitHub](https://github.com/Flock-engineering/flock-tech-guides/edit/dev/static/skills/github-actions/SKILL.md) — GitHub te propone hacer fork y PR automáticamente si no tenés permisos de push.
:::

[⬇ Descargar SKILL.md](pathname:///flock-tech-guides/skills/github-actions/SKILL.md)

---

````md
---
name: github-actions
description: >
  GitHub Actions con workflows de CI/CD, caching, secrets y buenas prácticas.
  Trigger: crear workflow GitHub Actions, agregar CI/CD, configurar pipeline, agregar job, cache GitHub Actions
license: MIT
metadata:
  author: flock-engineering
  version: '1.0'
  scope: [root]
  auto_invoke:
    - 'Crear workflow GitHub Actions'
    - 'Agregar CI/CD'
    - 'Configurar pipeline'
    - 'Agregar job GitHub Actions'
    - 'Cache GitHub Actions'
    - 'Configurar secrets Actions'
allowed-tools: Read, Edit, Write, Glob, Grep
---

# GitHub Actions Skill

## Critical Rules

### ALWAYS

- Fijar versiones de actions con **SHA completo** en producción: `actions/checkout@v4` mínimo, `actions/checkout@abc123...` para máxima seguridad
- Usar **secrets** para credenciales — nunca hardcodear tokens o contraseñas
- Agregar **timeouts** a todos los jobs para evitar runs colgados
- Usar **caching** de dependencias para reducir tiempos de build
- Definir **permisos mínimos** con `permissions:` explícito
- Agregar `concurrency:` para cancelar runs anteriores del mismo branch
- Separar workflows: CI (test/lint/build) vs CD (deploy)
- Usar **environments** de GitHub para deployments con aprobaciones
- Correr steps costosos en paralelo cuando no tienen dependencias

### NEVER

- Usar `${{ github.event.inputs.* }}` en un `run:` sin sanitizar — riesgo de injection
- Exponer secrets en outputs o logs
- Usar `self-hosted runners` sin hardening adecuado para repos públicos
- Ignorar fallos en steps críticos con `continue-on-error: true` sin logging explícito
- Usar `pull_request_target` con código no confiable del fork
- Dejar `permissions: write-all` como default

---

## CI — Node.js / NestJS

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, dev]
  pull_request:
    branches: [main, dev]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

permissions:
  contents: read

jobs:
  lint-and-test:
    name: Lint & Test
    runs-on: ubuntu-latest
    timeout-minutes: 15

    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER:     test
          POSTGRES_PASSWORD: test
          POSTGRES_DB:       testdb
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci --frozen-lockfile

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npx tsc --noEmit

      - name: Test
        run: npm run test:cov
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/testdb
          NODE_ENV: test

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        if: always()
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          fail_ci_if_error: false

  build:
    name: Build
    runs-on: ubuntu-latest
    timeout-minutes: 10
    needs: lint-and-test

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci --frozen-lockfile
      - run: npm run build
      - name: Upload build artifact
        uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/
          retention-days: 1
```

---

## CI — .NET

```yaml
# .github/workflows/ci-dotnet.yml
name: CI .NET

on:
  push:
    branches: [main, dev]
  pull_request:
    branches: [main, dev]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

permissions:
  contents: read

jobs:
  build-and-test:
    name: Build & Test
    runs-on: ubuntu-latest
    timeout-minutes: 20

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '8.0.x'

      - name: Cache NuGet
        uses: actions/cache@v4
        with:
          path: ~/.nuget/packages
          key: ${{ runner.os }}-nuget-${{ hashFiles('**/*.csproj') }}
          restore-keys: ${{ runner.os }}-nuget-

      - name: Restore
        run: dotnet restore

      - name: Build
        run: dotnet build --no-restore -c Release

      - name: Test
        run: dotnet test --no-build -c Release --verbosity normal --collect:"XPlat Code Coverage"

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
```

---

## CD — Deploy a Servidor (SSH)

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:
    inputs:
      environment:
        description: 'Ambiente de deploy'
        required: true
        default: 'staging'
        type: choice
        options: [staging, production]

permissions:
  contents: read
  deployments: write

jobs:
  deploy:
    name: Deploy to ${{ inputs.environment || 'staging' }}
    runs-on: ubuntu-latest
    timeout-minutes: 20
    environment: ${{ inputs.environment || 'staging' }}

    steps:
      - uses: actions/checkout@v4

      - name: Build Docker image
        run: |
          docker build \
            --target production \
            -t myapp:${{ github.sha }} \
            .

      - name: Login to Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Push image
        run: |
          docker tag myapp:${{ github.sha }} ghcr.io/${{ github.repository }}:${{ github.sha }}
          docker tag myapp:${{ github.sha }} ghcr.io/${{ github.repository }}:latest
          docker push ghcr.io/${{ github.repository }}:${{ github.sha }}
          docker push ghcr.io/${{ github.repository }}:latest

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
            docker system prune -f
```

---

## Reusable Workflow

```yaml
# .github/workflows/_setup-node.yml
name: Setup Node (reusable)

on:
  workflow_call:
    inputs:
      node-version:
        type: string
        default: '20'

jobs:
  setup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ inputs.node-version }}
          cache: 'npm'
      - run: npm ci --frozen-lockfile

# Uso en otro workflow:
# jobs:
#   build:
#     uses: ./.github/workflows/_setup-node.yml
#     with:
#       node-version: '20'
```

---

## Matrix Build (múltiples versiones/OS)

```yaml
jobs:
  test:
    strategy:
      fail-fast: false
      matrix:
        node-version: ['18', '20', '22']
        os: [ubuntu-latest, windows-latest]
        exclude:
          - os: windows-latest
            node-version: '18'

    runs-on: ${{ matrix.os }}
    name: Test Node ${{ matrix.node-version }} on ${{ matrix.os }}
    timeout-minutes: 15

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      - run: npm ci && npm test
```

---

## Workflow de PR Automático

```yaml
# .github/workflows/pr-checks.yml
name: PR Checks

on:
  pull_request:
    types: [opened, synchronize, reopened]

permissions:
  pull-requests: write
  contents: read

jobs:
  size-check:
    name: Check PR Size
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: Count changed lines
        id: changes
        run: |
          LINES=$(git diff --stat origin/${{ github.base_ref }}...HEAD | tail -1 | grep -oP '\d+(?= insertion)')
          echo "lines=${LINES:-0}" >> $GITHUB_OUTPUT

      - name: Warn on large PR
        if: ${{ steps.changes.outputs.lines > 500 }}
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '⚠️ Este PR tiene más de 500 líneas. Considerá dividirlo en PRs más pequeños.'
            })
```

---

## Secrets y Variables de Entorno

```yaml
# Secreto de repositorio/organización
env:
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
  API_KEY:      ${{ secrets.API_KEY }}

# Variable de entorno de GitHub (no secreta)
env:
  NODE_ENV: ${{ vars.NODE_ENV }}

# Secreto por environment (con aprobación manual)
environment: production
env:
  DEPLOY_URL: ${{ secrets.PROD_DEPLOY_URL }}

# Pasar secreto a docker build (sin exponer en logs)
- name: Build with secret
  run: docker build --secret id=api_key,env=API_KEY .
  env:
    API_KEY: ${{ secrets.API_KEY }}
```
````
