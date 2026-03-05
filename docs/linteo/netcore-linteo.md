---
id: netcore-linteo
title: "NetCore — Estándares y Linteo"
sidebar_label: NetCore
---

# NetCore — Estándares y Linteo

En Flock usamos **Visual Studio** como IDE principal para NetCore. El formateo y el linteo se configuran como extensiones integradas del IDE y se activan de forma automática al guardar o escribir código.

---

## Linteo

### SonarLint

SonarLint es una extensión de Visual Studio que analiza el código en tiempo real: detecta bugs, vulnerabilidades y code smells directamente en el editor, con sugerencias de corrección inline.

**Instalación:**

Instalar desde el [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=SonarSource.SonarLintforVisualStudio2022) o desde dentro del IDE:

1. `Extensions > Manage Extensions`
2. Buscar **SonarLint** → **Download**
3. Reiniciar Visual Studio para completar la instalación

Una vez instalado, SonarLint funciona automáticamente y marca las áreas problemáticas en el editor con detalles sobre cada issue.

---

## Formateo

### Code Cleanup on Save

Visual Studio tiene integrado un sistema de **Code Cleanup** que aplica reglas de formato automáticamente al guardar. Es la forma estándar de mantener consistencia sin depender de pasos manuales.

**Activación:**

1. `Tools > Options > Text Editor > C# > Code Style > Code Cleanup`
2. Activar la opción **Run Code Cleanup profile on Save**
3. Configurar un perfil de cleanup con las reglas deseadas (por defecto incluye organizar usings, formateo de espacios y llaves)

[![Code Cleanup on Save](https://i.postimg.cc/SstfcXPM/Captura-de-pantalla-2024-07-15-a-la-s-10-06-13.png)](https://postimg.cc/WFgZv4TN)
