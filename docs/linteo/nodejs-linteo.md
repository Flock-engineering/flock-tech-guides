---
id: nodejs-linteo
title: "NodeJS — Estándares y Linteo"
sidebar_label: NodeJS
---

# NodeJS — Estándares y Linteo

En Flock usamos **ESLint** como linter y **Prettier** como formateador en proyectos NodeJS, integrados en **Visual Studio Code**. ESLint se configura mediante un wizard interactivo que adapta las reglas al entorno y módulos del proyecto.

---

## Linteo

### ESLint (con wizard de configuración)

Instalar ESLint en la terminal del proyecto:

```bash
npm install eslint --save-dev
```

Luego correr el wizard de configuración interactivo:

```bash
npx @eslint/create-config
```

El wizard hace preguntas sobre el tipo de módulos, framework, entorno y estilo de código, y genera automáticamente el archivo de configuración (`eslint.config.js` o `.eslintrc.json` según la versión). Ejemplo de respuestas para NodeJS:

[![ESLint Init Wizard](https://i.postimg.cc/j5QcHPLp/Captura-de-pantalla-2024-07-17-a-la-s-15-40-30.png)](https://postimg.cc/njrqZsK2)

---

### Extensión ESLint en VSCode

La extensión ESLint en VSCode muestra los errores de linteo en tiempo real directamente en el editor, sin necesidad de correr comandos.

**Instalación:**

1. Ir a **Extensions** en el sidebar (`Ctrl+Shift+X`)
2. Buscar **ESLint** → **Install**

[![ESLint VSCode Extension](https://i.postimg.cc/8CXQZ4FD/Captura-de-pantalla-2024-07-11-a-la-s-17-14-04.png)](https://postimg.cc/gwhTJvqB)

---

## Formateo

### Prettier

Usamos **Prettier** como formateador opinado. Aplicamos su configuración por defecto sin modificar: no hace falta crear un `.prettierrc`. Podés leer su filosofía de estilo [aquí](https://prettier.io/docs/en/rationale).

**Instalación:**

1. Ir a **Extensions** en el sidebar (`Ctrl+Shift+X`)
2. Buscar **Prettier - Code formatter** → **Install**

[![Prettier VSCode Extension](https://i.postimg.cc/SNZXBmDZ/Captura-de-pantalla-2024-07-15-a-la-s-12-45-36.png)](https://postimg.cc/Ln16fFdf)

**Activar Format on Save en VSCode:**

![Format on Save](https://doimages.nyc3.cdn.digitaloceanspaces.com/006Community/prettier-in-vs-code/prettier-in-vscode5.png)

---

### Resolver conflictos entre Prettier y ESLint

ESLint incluye algunas reglas de estilo que pueden contradecir a Prettier. Para que prevalezca siempre Prettier en todo lo que sea formato, hay que deshabilitar esas reglas de ESLint instalando `eslint-config-prettier`:

```bash
npm install eslint-config-prettier --save-dev
```

Luego agregar `"prettier"` al final del array `extends` en el archivo de configuración de ESLint:

```json
{
  "extends": [
    "eslint:recommended",
    "prettier"
  ]
}
```

El `"prettier"` al final desactiva todas las reglas de ESLint que conflictúen con el formato de Prettier. Explicación completa: [eslint-config-prettier](https://github.com/prettier/eslint-config-prettier)

[![ESLint Prettier Config](https://i.postimg.cc/6QBY3gjP/Captura-de-pantalla-2024-07-15-a-la-s-11-24-30.png)](https://postimg.cc/18Yp7CZ0)
