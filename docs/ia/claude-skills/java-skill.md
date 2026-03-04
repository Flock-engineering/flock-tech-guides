---
id: java-skill
title: "Claude Skill: Java moderno"
sidebar_label: "Java Skill"
---

# Claude Skill: Java moderno

Skill que guía a Claude para escribir **Java moderno (17+) con calidad de código, sin duplicación y sin null bugs** — aplicando `Optional`, `record`, generics, streams, guard clauses y una jerarquía de excepciones bien definida.

:::tip Descarga el skill
<a href="/flock-tech-guides/skills/java/SKILL.md" download="SKILL.md">⬇ Descargar SKILL.md</a> — guardalo en `~/.claude/skills/java/SKILL.md` para instalarlo directamente.
:::

## ¿Qué hace?

Cuando Claude escribe o refactoriza código Java, este skill le indica:

- Usar `record` para DTOs inmutables en vez de clases con getters/setters
- Usar `Optional<T>` para eliminar nulls y sus bugs silenciosos
- **Anti-duplicación** con generics: `PaginatedResponse<T>`, `Result<T>`, `BaseRepository<T>`
- Usar **streams** para procesar colecciones en vez de loops imperativos
- Aplicar **guard clauses** para validar inputs al inicio del método
- Usar **pattern matching** con `instanceof` y `switch` (Java 16/21+)
- Definir **jerarquía de excepciones propia** — nunca `catch (Exception e)`
- Extraer constantes nombradas — sin magic numbers ni magic strings
- Patrón **Builder** para construcción de objetos complejos
- Reglas de análisis estático: SpotBugs, Checkstyle, Spotless

## ¿Cuándo se activa?

Claude lo invoca automáticamente al detectar:

> *"Crear clase Java"*, *"Crear servicio Java"*, *"Refactorizar Java"*, *"Mejorar calidad Java"*, *"Escribir código Java"*

## Reglas de calidad

| Regla | Descripción |
|---|---|
| **Sin `null` como retorno** | Usar `Optional<T>` o lanzar excepción específica |
| **Sin raw types** | `List<String>` no `List`, `Map<K,V>` no `Map` |
| **Sin catch vacíos** | Siempre loggear + relanzar o convertir a excepción de dominio |
| **Sin God Classes** | Clases < 200 líneas, métodos < 20 líneas |
| **Sin state mutable estático** | No `static` + no-`final` |
| **Sin `==` en Strings** | Siempre `.equals()` o `Objects.equals()` |
| **Sin casteos explícitos** | Usar pattern matching `instanceof` (Java 16+) |
| **Sin magic values** | Extraer a constantes nombradas |
| **Sin lógica duplicada** | Extraer a generics, clase base o utility |

## Patrones principales

### Record — DTO inmutable sin boilerplate

```java
// Una línea reemplaza clase con campos, constructor, getters, equals, hashCode, toString
public record CreateUserRequest(
    @NotBlank String   name,
    @Email    String   email,
    @NotNull  UserRole role
) {}

// Con factory method para evitar mapping disperso:
public record UserResponse(Long id, String name, String email) {
    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getName(), user.getEmail());
    }
}
```

### Optional — eliminar null bugs

```java
// ❌ Causa NullPointerException silenciosos
public User findById(Long id) {
    return repo.findById(id).orElse(null);
}

// ✅ Comunica explícitamente la ausencia
public Optional<User> findById(Long id) { return repo.findById(id); }
public User           getById(Long id)  {
    return repo.findById(id)
               .orElseThrow(() -> new EntityNotFoundException("User", id));
}
```

### Generics — una definición para todos los módulos

```java
// PaginatedResponse<T> — no duplicar por módulo
public record PaginatedResponse<T>(List<T> content, int page, long totalElements) {
    public static <T> PaginatedResponse<T> from(Page<T> page) {
        return new PaginatedResponse<>(page.getContent(), page.getNumber(),
                                       page.getTotalElements());
    }
}

// Result<T> con sealed classes (Java 17+) — type-safe sin excepciones de control de flujo
public sealed interface Result<T> permits Result.Success, Result.Failure {
    record Success<T>(T value)                        implements Result<T> {}
    record Failure<T>(String message, String code)    implements Result<T> {}
}
```

### Guard clauses — fail fast

```java
// ❌ Lógica principal enterrada en niveles de if anidados
public void process(Order order) {
    if (order != null) { if (!order.isEmpty()) { ... } }
}

// ✅ Falla temprano, lógica principal al nivel 0
public void process(Order order) {
    Objects.requireNonNull(order, "Order cannot be null");
    if (order.isEmpty()) throw new IllegalArgumentException("Order must have items");
    // lógica principal sin anidación
}
```

### Streams — colecciones declarativas

```java
// ❌ Loop imperativo
List<String> emails = new ArrayList<>();
for (User u : users) { if (u.isActive()) emails.add(u.getEmail()); }

// ✅ Stream declarativo
List<String> emails = users.stream()
    .filter(User::isActive)
    .map(User::getEmail)
    .collect(Collectors.toList());

Map<UserRole, List<User>> byRole = users.stream()
    .collect(Collectors.groupingBy(User::getRole));
```

## Cobertura de herramientas

| Herramienta | Propósito |
|---|---|
| **JUnit 5** | Tests unitarios y de integración |
| **Mockito** | Mocks y stubs |
| **AssertJ** | Assertions fluidas |
| **JaCoCo** | Cobertura de código |
| **SpotBugs** | Análisis estático — detecta bugs |
| **Checkstyle** | Estilo y convenciones |
| **Spotless** | Formateo automático |
| **Lombok** | Reduce boilerplate (`@Builder`, `@Slf4j`) |

## Instalación rápida

1. Descargá el `SKILL.md` con el botón de arriba
2. Abrí Claude Code en tu terminal
3. Adjuntá el archivo y enviá:

> *"Instalá este skill en `~/.claude/skills/java/SKILL.md`"*

## Nivel de aplicación

**Tipo:** Automático por inferencia | **Nivel:** Avanzado | **Java:** 17+
