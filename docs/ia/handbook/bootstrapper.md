---
sidebar_label: IA Bootstrapper
---

# IA Bootstrapper

---

## El instalador del Handbook

Todo lo que leiste en las secciones anteriores — linters estrictos, hooks, CI, CLAUDE.md — son piezas que hay que configurar en cada proyecto. Hacerlo a mano cada vez es tedioso, propenso a errores, y lo mas importante: alguien se va a saltear un paso. Siempre.

Por eso creamos **IA Bootstrapper**: un skill de Claude Code que configura TODO el pipeline de quality gates de forma desatendida. Vos le decis el stack, y el se encarga del resto.

> Un wizard que no te deja saltear nada.
> **Pregunta una vez, ejecuta todo, verifica cada paso.**

---

## Que configura

El bootstrapper ejecuta 5 pasos en orden estricto. Cada paso tiene un **gate de verificacion** que debe pasar antes de avanzar al siguiente. Si un gate falla, el wizard intenta arreglar hasta 2 veces. Si sigue fallando, frena y reporta — nunca avanza con algo roto.

| Paso | Que hace | Gate de verificacion |
|:-----|:---------|:--------------------|
| **Linters** | ESLint strict + Prettier (Node) o Checkstyle (Java) | Config valida, linter ejecuta sin error |
| **Hooks** | Husky + lint-staged + commitlint (Node) o scripts git (Java) | Archivos de hook existen y son ejecutables |
| **CI** | GitHub Actions con jobs de quality + security | YAML valido con los jobs esperados |
| **CLAUDE.md** | Archivo de convenciones para Claude Code | Archivo existe con secciones requeridas |
| **Verificacion** | Pasada final que valida todo junto | Todos los checks anteriores pasan de nuevo |

---

## Stacks soportados

| # | Stack | Framework |
|:--|:------|:----------|
| 1 | Node/TypeScript | Angular |
| 2 | Node/TypeScript | React |
| 3 | Node/TypeScript | NestJS |
| 4 | Node/TypeScript | Otro (Vite, Next, etc.) |
| 5 | Java | Spring Boot (Maven) |

---

## Instalacion

El bootstrapper vive en su propio repositorio. Para instalarlo:

```bash
git clone git@github.com:Flock-engineering/ia-bootstrapper.git
cd ia-bootstrapper
./install.sh
```

El script copia el skill a `~/.claude/skills/setup-handbook/`. Si ya existia una version anterior, crea un backup automatico.

:::info[Prerequisito]
Necesitas tener [Claude Code](https://docs.anthropic.com/en/docs/claude-code/overview) instalado. El script valida que exista `~/.claude/` antes de continuar.
:::

---

## Uso

Abri Claude Code en cualquier proyecto y escribi:

```
setup handbook
```

El wizard te muestra las opciones de stack, vos respondes (con el numero, el nombre, o como quieras — interpreta de forma flexible), y de ahi en adelante ejecuta todo **sin hacerte una sola pregunta mas**.

```
Handbook Setup Wizard
=====================

Que stack usa este proyecto?

1. Node/TypeScript — Angular
2. Node/TypeScript — React
3. Node/TypeScript — NestJS
4. Node/TypeScript — Otro (Vite, Next, etc.)
5. Java — Spring Boot (Maven)
```

Al finalizar, muestra un reporte con el estado de cada paso y los archivos creados.

---

## Que archivos genera

### Node/TypeScript

| Archivo | Proposito |
|:--------|:----------|
| `.eslintrc.json` | ESLint con `strict-type-checked`, complejidad acotada, cero `any` |
| `.prettierrc` | Formato consistente |
| `.husky/pre-commit` | Formatea archivos cambiados via lint-staged |
| `.husky/pre-push` | Lint + type check + tests antes de pushear |
| `.husky/commit-msg` | Valida conventional commits |
| `commitlint.config.js` | Config de commitlint |
| `.github/workflows/ci.yml` | Quality checks + security audit |
| `CLAUDE.md` | Convenciones del proyecto para Claude Code |

### Java (Spring Boot)

| Archivo | Proposito |
|:--------|:----------|
| `checkstyle.xml` | Complejidad ciclomatica, naming, javadoc |
| `.githooks/pre-push` | Checkstyle + compilacion + tests |
| `.github/workflows/ci.yml` | Quality checks + security audit (OWASP) |
| `CLAUDE.md` | Convenciones del proyecto para Claude Code |

:::tip[Archivos existentes]
Si un archivo de configuracion ya existe, el wizard crea un backup (`.bak`) antes de sobreescribirlo. No vas a perder nada.
:::

---

## Por que un wizard y no un script

Un script copia archivos y corre comandos. El wizard hace eso PERO ADEMAS:

- **Verifica cada paso** antes de avanzar al siguiente. Un script no sabe si la config de ESLint quedo valida. El wizard lo chequea.
- **Se adapta al framework**. Si elegis Angular, agrega `angular-eslint`. Si elegis React, agrega `eslint-plugin-react-hooks`. Un script generico no hace eso.
- **Arregla errores**. Si un gate falla, intenta corregir hasta 2 veces antes de rendirse. Un script falla y te deja a vos investigando.
- **No se puede saltear nada**. La maquina de estados del wizard no avanza si el paso anterior no paso su gate. Un script corre todo secuencialmente y si algo falla silenciosamente, nadie se entera.

---

## Repositorio

El codigo fuente del bootstrapper esta en:

**[github.com/Flock-engineering/ia-bootstrapper](https://github.com/Flock-engineering/ia-bootstrapper)**
