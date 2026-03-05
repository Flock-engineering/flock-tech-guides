---
id: nodejs-linteo
title: "NodeJS — Estándares y Linteo"
sidebar_label: NodeJS
---

# NodeJS — Estándares y Linteo

NodeJS usa **ESLint** como linter y **Prettier** como formateador. Ambos se integran en **Visual Studio Code**.

---

## Linteo

### ESLint (con wizard de configuración)

Instalar ESLint en la terminal del proyecto:

```bash
npm install eslint --save-dev
```

Luego correr el wizard de configuración interactivo:

```bash
./node_modules/.bin/eslint --init
```

El wizard hace preguntas sobre el entorno y genera la configuración adecuada. Ejemplo de respuestas para NodeJS:

[![ESLint Init Wizard](https://i.postimg.cc/j5QcHPLp/Captura-de-pantalla-2024-07-17-a-la-s-15-40-30.png)](https://postimg.cc/njrqZsK2)

---

### Extensión ESLint en VSCode

La extensión ESLint en VSCode provee feedback constante mientras escribís código.

**Instalación:**

1. Ir a **Extensions** en el sidebar
2. Buscar **ESLint** → **Install**

[![ESLint VSCode Extension](https://i.postimg.cc/8CXQZ4FD/Captura-de-pantalla-2024-07-11-a-la-s-17-14-04.png)](https://postimg.cc/gwhTJvqB)

---

## Formateo

### Prettier

Usamos **Prettier** como formateador opinado. Aplicamos su configuración por defecto sin modificar.

Podés leer su filosofía de estilo [aquí](https://prettier.io/docs/en/rationale).

**Instalación:**

1. Ir a **Extensions** en el sidebar
2. Buscar **Prettier** → **Install**

[![Prettier VSCode Extension](https://i.postimg.cc/SNZXBmDZ/Captura-de-pantalla-2024-07-15-a-la-s-12-45-36.png)](https://postimg.cc/Ln16fFdf)

**Activar Format on Save en VSCode:**

![Format on Save](https://doimages.nyc3.cdn.digitaloceanspaces.com/006Community/prettier-in-vs-code/prettier-in-vscode5.png)

---

### Prettier vs ESLint — Resolución de conflictos

ESLint puede tener reglas que conflictúen con Prettier. En materia de **formateo**, siempre prevalece Prettier. Para evitar conflictos, deshabilitamos las reglas de formato de ESLint:

[![ESLint Prettier Config](https://i.postimg.cc/6QBY3gjP/Captura-de-pantalla-2024-07-15-a-la-s-11-24-30.png)](https://postimg.cc/18Yp7CZ0)

Explicación completa: [eslint-config-prettier](https://github.com/prettier/eslint-config-prettier)
