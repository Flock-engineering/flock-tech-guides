---
id: python-skill-raw
title: "SKILL.md — Python"
sidebar_label: "SKILL.md"
---

# SKILL.md — Python

Archivo de instrucciones que Claude usa internamente. Si encontrás algo para mejorar, abrí un PR directamente.

:::info Contribuir
[✏️ Sugerir corrección en GitHub](https://github.com/Flock-engineering/flock-tech-guides/edit/dev/static/skills/python/SKILL.md) — GitHub te propone hacer fork y PR automáticamente si no tenés permisos de push.
:::

[⬇ Descargar SKILL.md](pathname:///flock-tech-guides/skills/python/SKILL.md)

---

````md
---
name: python
description: >
  Python moderno con type hints, calidad de código, Pydantic y buenas prácticas.
  Trigger: crear script Python, crear clase Python, refactorizar Python, Pydantic, FastAPI, agregar tipos Python
license: MIT
metadata:
  author: flock-engineering
  version: '1.0'
  scope: [root]
  auto_invoke:
    - 'Crear script Python'
    - 'Crear clase Python'
    - 'Refactorizar Python'
    - 'Agregar tipos Python'
    - 'Pydantic'
    - 'FastAPI'
    - 'Mejorar calidad Python'
allowed-tools: Read, Edit, Write, Glob, Grep, Bash
---

# Python Skill

## Critical Rules

### ALWAYS

- Usar **type hints** en todos los parámetros, retornos y variables no inferibles
- Usar `dataclass` o `Pydantic BaseModel` para estructuras de datos
- Usar **context managers** (`with`) para archivos, conexiones y recursos
- Nombrar variables/funciones en `snake_case`, clases en `PascalCase`, constantes en `UPPER_SNAKE`
- Manejar excepciones con tipos específicos — nunca `except Exception` sin re-raise o log
- Usar `pathlib.Path` en vez de `os.path` para rutas
- Agregar docstrings en funciones públicas (Google style)
- Usar `logging` en vez de `print` para código de producción
- Usar list/dict/set comprehensions en vez de loops con `.append()`
- Tipar colecciones: `list[str]`, `dict[str, int]`, `tuple[str, ...]` (Python 3.9+)

### NEVER

- Usar tipos mutables como valor por defecto en funciones (`def f(items=[])` → bug clásico)
- Ignorar excepciones con `except: pass` o `except Exception: pass`
- Usar `os.path` cuando `pathlib` está disponible
- Usar `print()` para logging en producción
- Hacer imports con `*` (`from module import *`)
- Usar variables globales para estado compartido — usar clases o inyección
- Concatenar strings en loops — usar `str.join()` o f-strings

---

## Funciones Tipadas

```python
from typing import Optional

def calculate_discount(
    price: float,
    discount_pct: float,
    max_discount: float = 100.0,
) -> float:
    """Calcula el precio con descuento aplicado.

    Args:
        price: Precio original en la moneda base.
        discount_pct: Porcentaje de descuento (0-100).
        max_discount: Descuento máximo permitido.

    Returns:
        Precio final con descuento aplicado.

    Raises:
        ValueError: Si el precio es negativo o el descuento está fuera de rango.
    """
    if price < 0:
        raise ValueError(f"El precio no puede ser negativo: {price}")
    if not 0 <= discount_pct <= 100:
        raise ValueError(f"El descuento debe estar entre 0 y 100: {discount_pct}")

    effective_discount = min(discount_pct, max_discount)
    return price * (1 - effective_discount / 100)
```

---

## Dataclass Pattern

```python
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional

@dataclass
class User:
    id: str
    name: str
    email: str
    role: str = 'USER'
    is_active: bool = True
    created_at: datetime = field(default_factory=datetime.utcnow)
    tags: list[str] = field(default_factory=list)  # ✅ no usar [] como default

    def display_name(self) -> str:
        return f"{self.name} <{self.email}>"

    def __post_init__(self) -> None:
        if not self.email or '@' not in self.email:
            raise ValueError(f"Email inválido: {self.email}")
```

---

## Pydantic v2 (validación y serialización)

```python
from pydantic import BaseModel, EmailStr, Field, field_validator
from datetime import datetime
from typing import Optional

class CreateUserDto(BaseModel):
    name: str        = Field(min_length=3, max_length=100)
    email: EmailStr
    role: str        = Field(default='USER', pattern=r'^(USER|ADMIN|EDITOR)$')
    age: Optional[int] = Field(default=None, ge=18, le=120)

    @field_validator('name')
    @classmethod
    def name_must_not_be_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError('El nombre no puede estar vacío')
        return v.strip()

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    created_at: datetime

    model_config = {'from_attributes': True}  # permite crear desde ORM objects

# Uso
dto = CreateUserDto(name='Lucas', email='lucas@flock.com', role='ADMIN')
print(dto.model_dump())
print(dto.model_dump_json())
```

---

## Manejo de Errores

```python
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class AppError(Exception):
    """Error base de la aplicación."""
    def __init__(self, message: str, code: str, status_code: int = 500) -> None:
        super().__init__(message)
        self.code        = code
        self.status_code = status_code

class NotFoundError(AppError):
    def __init__(self, resource: str, resource_id: str) -> None:
        super().__init__(
            message=f"{resource} con id '{resource_id}' no encontrado",
            code='NOT_FOUND',
            status_code=404,
        )

# Manejo correcto
def get_user(user_id: str) -> User:
    try:
        user = db.query(User).filter_by(id=user_id).first()
    except DatabaseError as e:
        logger.error("Error consultando usuario %s: %s", user_id, e)
        raise AppError("Error de base de datos", "DB_ERROR") from e

    if user is None:
        raise NotFoundError("Usuario", user_id)

    return user
```

---

## Context Manager y Archivos

```python
from pathlib import Path
import json
import csv
from typing import Any

# ✅ pathlib en vez de os.path
def read_config(config_path: Path) -> dict[str, Any]:
    """Lee configuración desde un archivo JSON."""
    if not config_path.exists():
        raise FileNotFoundError(f"Config no encontrada: {config_path}")

    with config_path.open('r', encoding='utf-8') as f:
        return json.load(f)

# Escribir CSV
def write_report(rows: list[dict[str, Any]], output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with output_path.open('w', newline='', encoding='utf-8') as f:
        if not rows:
            return
        writer = csv.DictWriter(f, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)

# Context manager propio
class DatabaseConnection:
    def __enter__(self) -> 'DatabaseConnection':
        self._connect()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb) -> bool:
        self._disconnect()
        return False  # no suprimir excepciones
```

---

## List/Dict Comprehensions

```python
users = [
    User(id='1', name='Ana',  email='ana@flock.com',  role='ADMIN'),
    User(id='2', name='Luis', email='luis@flock.com', role='USER'),
    User(id='3', name='Mia',  email='mia@flock.com',  role='USER'),
]

# ✅ list comprehension
active_emails = [u.email for u in users if u.is_active]

# ✅ dict comprehension
users_by_id: dict[str, User] = {u.id: u for u in users}

# ✅ set comprehension (roles únicos)
roles: set[str] = {u.role for u in users}

# ✅ generador para procesar sin cargar todo en memoria
total = sum(u.age or 0 for u in users)

# ❌ NO — loop con append
result = []
for u in users:
    if u.is_active:
        result.append(u.email)
```

---

## Logging Correcto

```python
import logging
import sys

def setup_logging(level: str = 'INFO') -> None:
    logging.basicConfig(
        level=getattr(logging, level.upper()),
        format='%(asctime)s | %(levelname)-8s | %(name)s | %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S',
        stream=sys.stdout,
    )

logger = logging.getLogger(__name__)

# ✅ Correcto — lazy formatting con %s
logger.info("Procesando usuario %s de %s", user_id, total)
logger.error("Error en operación %s: %s", op_name, error, exc_info=True)

# ❌ MAL — concatenación eager (evalúa aunque el nivel no lo muestre)
logger.debug("User: " + str(user))  # nunca esto
logger.debug(f"User: {user}")       # ni esto si el objeto es costoso de serializar
```

---

## Commands

```bash
# Verificar tipos
mypy src/ --strict

# Linting
ruff check src/
ruff format src/

# Tests
pytest tests/ -v --cov=src

# Crear entorno virtual
python -m venv .venv
source .venv/bin/activate   # Linux/Mac
.venv\Scripts\activate      # Windows

# Instalar dependencias
pip install -r requirements.txt
pip install -r requirements-dev.txt
```
````
