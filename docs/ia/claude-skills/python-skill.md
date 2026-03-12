---
id: python-skill
title: "Claude Skill: Python moderno"
sidebar_label: "Python Skill"
---

# Claude Skill: Python moderno

Skill que guía a Claude para escribir Python con type hints completos, Pydantic v2, manejo de errores explícito y buenas prácticas de calidad de código.

:::tip Descarga el skill
<a href="/flock-tech-guides/skills/python/SKILL.md" download="SKILL.md">⬇ Descargar SKILL.md</a> — guardalo en `~/.claude/skills/python/SKILL.md` para instalarlo directamente.
:::

## ¿Qué hace?

Cuando Claude escribe o refactoriza código Python, este skill le indica:

- Usar **type hints** en todos los parámetros, retornos y variables no inferibles
- Usar `dataclass` o `Pydantic BaseModel` para estructuras de datos
- Usar **context managers** (`with`) para archivos, conexiones y recursos
- Nombrar en `snake_case`, clases en `PascalCase`, constantes en `UPPER_SNAKE`
- Manejar excepciones con tipos específicos — nunca `except Exception` sin re-raise o log
- Usar `pathlib.Path` en vez de `os.path` para rutas
- Agregar docstrings en funciones públicas (Google style)
- Usar `logging` en vez de `print` en código de producción

## ¿Cuándo se activa?

Claude lo invoca automáticamente al detectar:

> *"Crear script Python"*, *"Crear clase Python"*, *"Refactorizar Python"*, *"Agregar tipos Python"*, *"Pydantic"*, *"FastAPI"*, *"Mejorar calidad Python"*

## Reglas de calidad

| Regla | Descripción |
|---|---|
| **Sin mutables como default** | `def f(items=[])` es un bug clásico — usar `field(default_factory=list)` |
| **Sin `except: pass`** | Nunca ignorar excepciones silenciosamente |
| **Sin `os.path`** | Usar `pathlib.Path` |
| **Sin `print` en producción** | Usar `logging` con lazy formatting |
| **Sin `import *`** | Imports explícitos siempre |
| **Sin globals mutables** | Usar clases o inyección de dependencias |

## Dataclass con validación

```python
from dataclasses import dataclass, field
from datetime import datetime

@dataclass
class User:
    id: str
    name: str
    email: str
    role: str = 'USER'
    tags: list[str] = field(default_factory=list)  # ✅ no usar [] como default

    def __post_init__(self) -> None:
        if not self.email or '@' not in self.email:
            raise ValueError(f"Email inválido: {self.email}")
```

## Pydantic v2 para DTOs

```python
from pydantic import BaseModel, EmailStr, Field

class CreateUserDto(BaseModel):
    name: str      = Field(min_length=3, max_length=100)
    email: EmailStr
    role: str      = Field(default='USER', pattern=r'^(USER|ADMIN|EDITOR)$')

# Uso
dto = CreateUserDto(name='Lucas', email='lucas@flock.com', role='ADMIN')
print(dto.model_dump())
```

## Instalación rápida

1. Descargá el `SKILL.md` con el botón de arriba
2. Abrí Claude Code en tu terminal
3. Adjuntá el archivo y enviá:

> *"Instalá este skill en `~/.claude/skills/python/SKILL.md`"*

## Nivel de aplicación

**Tipo:** Automático por inferencia | **Nivel:** Avanzado
