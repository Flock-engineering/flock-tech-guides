---
id: java-linteo
title: "Java — Estándares y Linteo"
sidebar_label: Java
---

# Java — Estándares y Linteo

Para Java recomendamos usar el IDE **IntelliJ Community Edition**.

---

## Formateo

### Save Actions X (Plugin IntelliJ)

Usamos el plugin "Save Actions X" para formatear el código al guardar, organizar imports y métodos automáticamente.

**Instalación:**

1. `File > Settings > Plugins`
2. Buscar **Save Actions X** → **Install**
3. Buscar **Actions on Save** en Settings y configurarlo como muestra la imagen:

[![Save Actions Config](https://i.postimg.cc/ZqBBxMgr/Captura-de-pantalla-2024-07-11-a-la-s-14-10-21.png)](https://postimg.cc/SX4xyDms)

---

### Google Java Code Style (XML)

Seguimos el **Google Java Code Style**. La mejor forma de aplicarlo es usando el formateo automático de IntelliJ con el archivo de configuración XML oficial.

**Instalación:**

1. Descargar el XML desde [aquí](https://github.com/google/styleguide/blob/gh-pages/intellij-java-google-style.xml)
2. `File > Settings > Editor > Code Style`
3. Importar el `.xml`
4. En la sección Java → cambiar el tamaño de indentado a **4**

![Code Style Config](https://image.ibb.co/jRB9k0/code-style.png)

---

## Linteo

### SonarLint (Plugin IntelliJ)

SonarLint analiza el código en tiempo real y marca áreas problemáticas con sugerencias de corrección.

**Instalación:**

1. `File > Settings > Plugins`
2. Buscar **SonarLint** → **Browse repositories** → **Install**

![SonarLint Plugin](https://image.ibb.co/gvDxsf/sonarlint1.png)

SonarLint se configura automáticamente. Las áreas con problemas quedan marcadas directamente en el editor:

![SonarLint Highlight](https://image.ibb.co/bFriXf/sonarlint2.png)

Para personalizar colores de resaltado: `File > Settings > SonarLint`

![SonarLint Colors](https://image.ibb.co/b5O8yL/sonarlint3.png)
