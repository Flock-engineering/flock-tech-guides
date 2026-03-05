---
id: java-linteo
title: "Java — Estándares y Linteo"
sidebar_label: Java
---

# Java — Estándares y Linteo

En Flock usamos **IntelliJ IDEA Community Edition** como IDE para Java. Las herramientas de linteo y formateo se configuran como plugins del IDE y se activan automáticamente mientras trabajás, sin pasos manuales durante el desarrollo.

---

## Linteo

### SonarLint

SonarLint es un plugin de IntelliJ que analiza el código en tiempo real: detecta bugs potenciales, code smells y malas prácticas, y los marca directamente en el editor con sugerencias de corrección.

**Instalación:**

1. `File > Settings > Plugins`
2. Buscar **SonarLint** → **Browse repositories** → **Install**

![SonarLint Plugin](https://image.ibb.co/gvDxsf/sonarlint1.png)

Una vez instalado, SonarLint se configura automáticamente. Las áreas problemáticas quedan subrayadas en el editor:

![SonarLint Highlight](https://image.ibb.co/bFriXf/sonarlint2.png)

Para personalizar los colores de resaltado: `File > Settings > SonarLint`

![SonarLint Colors](https://image.ibb.co/b5O8yL/sonarlint3.png)

---

## Formateo

### Save Actions X

El plugin **Save Actions X** formatea el código, organiza imports y ordena métodos automáticamente cada vez que guardás un archivo. Elimina la necesidad de formatear manualmente.

**Instalación:**

1. `File > Settings > Plugins`
2. Buscar **Save Actions X** → **Install**
3. Ir a `File > Settings > Actions on Save` y configurarlo como muestra la imagen:

[![Save Actions Config](https://i.postimg.cc/ZqBBxMgr/Captura-de-pantalla-2024-07-11-a-la-s-14-10-21.png)](https://postimg.cc/SX4xyDms)

---

### Google Java Code Style

Seguimos el **Google Java Code Style** como estándar de formato. Se aplica importando el archivo XML oficial en IntelliJ.

**Instalación:**

1. Descargar el XML desde [aquí](https://github.com/google/styleguide/blob/gh-pages/intellij-java-google-style.xml)
2. `File > Settings > Editor > Code Style`
3. Importar el `.xml`
4. En la sección Java → cambiar el tamaño de indentado a **4**

![Code Style Config](https://image.ibb.co/jRB9k0/code-style.png)
