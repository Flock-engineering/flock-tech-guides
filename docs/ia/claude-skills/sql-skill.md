---
id: sql-skill
title: "Claude Skill: SQL"
sidebar_label: "SQL Skill"
---

# Claude Skill: SQL

Skill que guía a Claude para escribir queries SQL con CTEs, window functions, índices correctos y buenas prácticas de rendimiento y seguridad.

:::tip Descarga el skill
<a href="/flock-tech-guides/skills/sql/SKILL.md" download="SKILL.md">⬇ Descargar SKILL.md</a> — guardalo en `~/.claude/skills/sql/SKILL.md` para instalarlo directamente.
:::

## ¿Qué hace?

Cuando Claude escribe o revisa queries SQL, este skill le indica:

- Usar **CTEs** (`WITH`) para queries complejas en vez de subqueries anidadas
- Formatear SQL con keywords en MAYÚSCULAS y columnas/tablas en minúsculas
- Agregar índices en columnas usadas en `WHERE`, `JOIN` y `ORDER BY` frecuentes
- Usar paginación cursor-based para listas grandes (no `OFFSET` alto)
- Wrappear operaciones multi-tabla en **transacciones** explícitas
- Usar `RETURNING` en `INSERT`/`UPDATE`/`DELETE` para evitar re-queries
- Preferir `EXISTS` sobre `COUNT(*)` para verificar existencia
- Filtrar siempre por `deleted_at IS NULL` en tablas con soft-delete

## ¿Cuándo se activa?

Claude lo invoca automáticamente al detectar:

> *"Escribir query SQL"*, *"Optimizar query"*, *"Crear índice SQL"*, *"CTE SQL"*, *"Window function"*, *"Transacción SQL"*, *"Query PostgreSQL"*, *"Agregar paginación SQL"*

## Reglas de calidad

| Regla | Descripción |
|---|---|
| **Sin `SELECT *`** | Listar columnas explícitamente en producción |
| **Sin N+1 queries** | Resolver con JOINs o batch loads |
| **Sin concatenación de strings** | Usar parámetros `$1`, `?` para evitar SQL injection |
| **Índices en FKs** | Siempre indexar claves foráneas |
| **Sin `DISTINCT` para tapar JOINs** | Corregir el JOIN mal hecho |
| **Transacciones cerradas** | Siempre commit o rollback explícito |

## Query con CTE

```sql
WITH active_users AS (
  SELECT u.id, u.name, u.email
  FROM users u
  WHERE u.deleted_at IS NULL AND u.is_active = true
),
user_order_stats AS (
  SELECT o.user_id, COUNT(*) AS total_orders, SUM(o.total) AS lifetime_value
  FROM orders o
  WHERE o.status != 'CANCELLED'
  GROUP BY o.user_id
)
SELECT
  au.id, au.name,
  COALESCE(uos.total_orders, 0)   AS total_orders,
  COALESCE(uos.lifetime_value, 0) AS lifetime_value
FROM active_users au
LEFT JOIN user_order_stats uos ON uos.user_id = au.id
ORDER BY uos.lifetime_value DESC NULLS LAST;
```

## Window function — ranking por departamento

```sql
SELECT
  id, name, department, salary,
  ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) AS rank_in_dept
FROM employees;
```

## Instalación rápida

1. Descargá el `SKILL.md` con el botón de arriba
2. Abrí Claude Code en tu terminal
3. Adjuntá el archivo y enviá:

> *"Instalá este skill en `~/.claude/skills/sql/SKILL.md`"*

## Nivel de aplicación

**Tipo:** Automático por inferencia | **Nivel:** Avanzado
