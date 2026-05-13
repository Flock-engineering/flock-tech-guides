---
sidebar_label: Setup de CI
---

# Setup de CI

## El CI ya no es solo para humanos

Pensalo un segundo. Durante anos, el pipeline de CI fue una red de seguridad para el equipo humano: corria los tests, chequeaba el formato, y si algo fallaba, un dev se sentaba a arreglarlo. El costo de cada fix era tiempo de una persona. Tiempo caro. Tiempo finito.

Ahora la ecuacion cambio por completo.

Cuando usas IA para escribir codigo, el CI se convierte en algo mucho mas poderoso: es el **layer de enforcement** que obliga a la IA a cumplir tus reglas. Ya no es solo una red de seguridad, es un **inspector de obra**. Vos sos el arquitecto, la IA es el constructor, y el CI es el inspector municipal que no deja pasar ni una pared que no cumpla con el codigo de edificacion.

Y aca viene lo importante: la IA va a tomar atajos si vos la dejas. Va a generar codigo que "funciona" pero no respeta tus convenciones. Va a saltarse tipos estrictos, va a ignorar edge cases en los tests, va a escribir funciones de 80 lineas si nadie le dice que no. El CI es ese "alguien" que le dice que no. Automaticamente. Sin cansarse. Sin negociar.

El loop que se genera es hermoso en su simplicidad:

1. La IA genera codigo
2. El CI lo evalua y rechaza lo que no cumple
3. La IA corrige basandose en los errores del CI
4. El CI pasa

Ese ciclo es **automatico** y cuesta practicamente nada. No hay un humano sentado arreglando warnings de ESLint a las 6 de la tarde. No hay un dev discutiendo si "esa regla es demasiado estricta". La maquina genera, la maquina valida, la maquina corrige.

:::tip
Cuando Claude Code corre en modo CI (por ejemplo con `claude --ci`), puede leer los errores del pipeline y autocorregirse. Asegurate de que los mensajes de error de cada check sean claros y descriptivos: la IA necesita entender QUE fallo y POR QUE para poder arreglarlo.
:::

## El CI como documentacion viva de tus estandares

Hay algo que nadie dice pero todos saben: las guias de estilo en un wiki no las lee nadie. Escribis 15 paginas de "coding standards", las pones en Confluence o Notion, y a los dos meses estan desactualizadas y nadie las consulta.

Tu configuracion de CI **es** tu estandar de codigo. No es un documento que describe lo que deberia ser; es un sistema que EJECUTA lo que debe ser. Si tu CI rechaza funciones sin tipos de retorno, ese ES tu estandar. Si tu CI pide 85% de coverage, ese ES tu threshold. No hay ambiguedad, no hay interpretacion, no hay "yo pense que era de otra forma".

Y esto tiene una consecuencia practica enorme para equipos que usan IA: cuando arrancas una nueva sesion de Claude Code, no necesitas explicarle todos tus estandares. El agente genera codigo, el CI lo rechaza si no cumple, y el agente aprende de los errores. Tu CI le esta ensenando tus estandares en tiempo real, en cada push.

Cuando se suma un dev nuevo al equipo, pasa lo mismo. No necesita leerse un documento de 40 paginas. Pushea, el CI le dice que esta mal, corrige. Aprendizaje por feedback inmediato. Como debe ser.

:::info
Si usas `CLAUDE.md` o skills para definir convenciones, el CI es la **verificacion** de que esas convenciones se cumplen. Las instrucciones le dicen a la IA COMO escribir codigo; el CI verifica que efectivamente lo hizo bien. Son complementarios, no redundantes.
:::

## Que deberia verificar tu CI

Un pipeline de CI serio para equipos que trabajan con IA deberia cubrir estas areas. Cada check tiene que producir mensajes de error claros y accionables para que la IA pueda autocorregirse.

### Checks esenciales

| Check | Herramienta | Proposito |
|---|---|---|
| **Linting** | ESLint / Biome | Estilo, patrones, errores comunes |
| **Formato** | Prettier / Biome | Formato consistente sin discusiones |
| **Type checking** | `tsc --noEmit` con strict | Seguridad de tipos en todo el codebase |
| **Tests** | Jest / Vitest | Validacion funcional con coverage threshold |
| **Build** | Framework CLI | Verificar que el proyecto compila correctamente |
| **Seguridad** | `npm audit` / Snyk | Dependencias sin vulnerabilidades conocidas |

### Checks avanzados (recomendados)

| Check | Herramienta | Proposito |
|---|---|---|
| **Complejidad** | ESLint complexity rules | Funciones simples y mantenibles |
| **Bundle size** | size-limit | Detectar regresiones de tamano |
| **Conventional commits** | commitlint | Mensajes de commit consistentes |
| **PR size** | Custom check | PRs chicos y revisables |

## Ejemplo practico: GitHub Actions

Este es un workflow de GitHub Actions que implementa todas las verificaciones esenciales con reglas estrictas. Usalo como base y ajustalo a tu stack.

```yaml title=".github/workflows/ci.yml"
name: CI

on:
  pull_request:
    branches: [main, dev]
  push:
    branches: [main, dev]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  quality:
    name: Quality Checks
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - run: npm ci

      # Formato — tiene que ser lo primero, es lo mas rapido
      - name: Check formatting
        run: npx prettier --check .

      # Linting — reglas estrictas, cero warnings permitidos
      - name: Lint
        run: npx eslint . --max-warnings 0

      # Type checking — modo strict, sin emitir archivos
      - name: Type check
        run: npx tsc --noEmit

      # Tests — con threshold de coverage
      - name: Tests
        run: npx vitest run --coverage --reporter=verbose

      # Coverage threshold — rechazar si baja del minimo
      - name: Check coverage threshold
        run: |
          npx vitest run --coverage --coverage.thresholds.lines=80 \
            --coverage.thresholds.functions=80 \
            --coverage.thresholds.branches=80 \
            --coverage.thresholds.statements=80

      # Build — verificar que compila
      - name: Build
        run: npm run build

  security:
    name: Security Audit
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - run: npm ci

      - name: Audit dependencies
        run: npm audit --audit-level=high
```

:::tip
Separa los jobs de calidad y seguridad para que corran en paralelo. Si el linting falla, no necesitas esperar a que terminen los tests para verlo. Feedback rapido = ciclo de correccion rapido.
:::

## El CI como parte del loop con IA

Para que el ciclo de "generar, validar, corregir" funcione de manera fluida, hay algunas practicas clave:

**Mensajes de error descriptivos.** Cada regla de lint, cada test que falla, cada error de tipos tiene que producir un mensaje que la IA pueda interpretar y actuar. "Error en linea 42" no alcanza. "La funcion `calculateTotal` excede el limite de complejidad ciclomatica (15/10)" es perfecto.

**Fail fast.** Ordena los checks de mas rapido a mas lento: formato, lint, tipos, tests, build. Si el formato esta mal, no tiene sentido correr los tests. El feedback tiene que llegar lo antes posible.

**Branch protection.** Configura reglas de proteccion en `main` y `dev` que requieran que TODOS los checks pasen antes de permitir el merge. Sin excepciones. Sin "override by admin". Si el CI no pasa, no se mergea. Punto.

**Reproducibilidad local.** Asegurate de que el dev (o la IA) pueda correr los mismos checks localmente antes de pushear. Si los checks solo corren en CI, el ciclo de feedback se hace lento e ineficiente. Idealmente, tus pre-commit hooks corren un subset rapido de los mismos checks.

---

El CI ya no es un costo operativo que "hay que bancar". Es la herramienta mas poderosa que tenes para mantener la calidad cuando trabajas con IA. Cuanto mas estricto sea tu pipeline, mejor codigo va a producir la IA. Es asi de simple.
