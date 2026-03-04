---
id: java-skill
title: "Claude Skill: Java moderno"
sidebar_label: "Java Skill"
---

# Claude Skill: Java moderno

Skill que guía a Claude para escribir **Java moderno (17+) con Lombok como estándar**, calidad de código, sin duplicación y sin null bugs — aplicando `Optional`, `record`, generics, streams, guard clauses y una jerarquía de excepciones bien definida.

:::tip Descarga el skill
<a href="/flock-tech-guides/skills/java/SKILL.md" download="SKILL.md">⬇ Descargar SKILL.md</a> — guardalo en `~/.claude/skills/java/SKILL.md` para instalarlo directamente.
:::

## ¿Qué hace?

Cuando Claude escribe o refactoriza código Java, este skill le indica:

- Usar **Lombok** como librería estándar: `@RequiredArgsConstructor`, `@Slf4j`, `@Builder`, `@Getter`, `@NonNull`, `@With`
- Usar `record` para DTOs inmutables en vez de clases con getters/setters
- Usar `Optional<T>` para eliminar nulls y sus bugs silenciosos
- **Anti-duplicación** con generics: `PaginatedResponse<T>`, `Result<T>`, `BaseRepository<T>`
- Usar **streams** para procesar colecciones en vez de loops imperativos
- Aplicar **guard clauses** para validar inputs al inicio del método
- Usar **pattern matching** con `instanceof` y `switch` (Java 16/21+)
- Definir **jerarquía de excepciones propia** — nunca `catch (Exception e)`
- Extraer constantes nombradas — sin magic numbers ni magic strings
- Configuración de Lombok para Maven y Gradle

## ¿Cuándo se activa?

Claude lo invoca automáticamente al detectar:

> *"Crear clase Java"*, *"Crear servicio Java"*, *"Refactorizar Java"*, *"Mejorar calidad Java"*, *"Escribir código Java"*, *"Usar Lombok"*

## Lombok como estándar

Lombok elimina el boilerplate de Java sin sacrificar legibilidad. El skill lo usa en todos los patrones:

| Anotación | Qué genera | Cuándo usar |
|---|---|---|
| `@RequiredArgsConstructor` | Constructor para campos `final` y `@NonNull` | **Siempre** en servicios Spring Boot — inyección por constructor |
| `@Slf4j` | Campo `log` con SLF4J | **Siempre** — nunca crear Logger manualmente |
| `@Builder` | Patrón builder completo | Objetos con más de 3 parámetros de construcción |
| `@Builder.Default` | Valor por defecto en el builder | Campos con valor inicial dentro de un `@Builder` |
| `@SuperBuilder` | Builder compatible con herencia | Cuando la clase padre también usa `@Builder` |
| `@Getter` / `@Setter` | Getters y/o setters | Entidades y clases simples (granular, no `@Data` en JPA) |
| `@EqualsAndHashCode(of="id")` | equals/hashCode solo por `id` | Entidades JPA — evita comparar todos los campos |
| `@ToString(exclude=...)` | toString sin campos sensibles/lazy | Entidades con colecciones lazy o campos sensibles |
| `@NonNull` | Null check con mensaje claro | Parámetros de métodos públicos |
| `@With` | Métodos `withXxx(value)` que retornan copia | Objetos inmutables que necesitan "modificaciones" |
| `@Data` | Todo en uno | **Solo** en DTOs simples — **nunca** en entidades JPA |

### Antipatrones Lombok en JPA

```java
// ❌ MAL — @Data en entidad JPA
@Data              // genera toString con TODAS las relaciones → N+1 / infinite recursion
@Entity
public class User { @OneToMany List<Order> orders; }

// ✅ BIEN — control granular en entidades
@Entity
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
@ToString(exclude = "orders")
public class User { @OneToMany List<Order> orders; }
```

## Reglas de calidad

| Regla | Descripción |
|---|---|
| **`@Slf4j` obligatorio** | Nunca `LoggerFactory.getLogger(...)` manual |
| **`@RequiredArgsConstructor`** | Nunca `@Autowired` en campo |
| **`@Builder.Default` en builders** | Sin él, los campos son `null`/`0` en el builder |
| **Sin `null` como retorno** | Usar `Optional<T>` o lanzar excepción específica |
| **Sin raw types** | `List<String>` no `List`, `Map<K,V>` no `Map` |
| **Sin catch vacíos** | Siempre loggear + relanzar o convertir a excepción de dominio |
| **Sin God Classes** | Clases < 200 líneas, métodos < 20 líneas |
| **Sin `==` en Strings** | Siempre `.equals()` o `Objects.equals()` |
| **Sin casteos explícitos** | Usar pattern matching `instanceof` (Java 16+) |
| **Sin magic values** | Extraer a constantes nombradas |

## Patrones principales

### Servicio Spring Boot con Lombok completo

```java
@Service
@RequiredArgsConstructor   // inyección por constructor sin @Autowired
@Slf4j                     // logger "log" disponible
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper     userMapper;

    @Transactional
    public UserResponse create(@NonNull CreateUserRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException("Email already in use", "EMAIL_CONFLICT");
        }
        User saved = userRepository.save(userMapper.toEntity(request));
        log.info("User created id={}", saved.getId());
        return userMapper.toResponse(saved);
    }
}
```

### Builder con `@Builder.Default`

```java
@Builder
@Getter
public class EmailMessage {
    private final String to;
    private final String subject;

    @Builder.Default  // sin esto, body sería null en el builder
    private final String body = "";

    @Builder.Default
    private final List<String> cc = List.of();
}

EmailMessage email = EmailMessage.builder()
    .to("user@example.com")
    .subject("Bienvenido")
    .body("Tu cuenta fue creada.")
    .build();
```

### Record — DTO inmutable (Java 16+)

```java
public record CreateUserRequest(
    @NotBlank String name,
    @Email    String email
) {}

public record UserResponse(Long id, String name, String email) {
    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getName(), user.getEmail());
    }
}
```

### Optional — eliminar null bugs

```java
public User getById(Long id) {
    return repo.findById(id)
               .orElseThrow(() -> new EntityNotFoundException("User", id));
}
```

### Streams — colecciones declarativas

```java
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
| **Lombok** | Elimina boilerplate: constructores, getters, logger, builder |
| **JUnit 5** | Tests unitarios y de integración |
| **Mockito** | Mocks y stubs |
| **AssertJ** | Assertions fluidas |
| **JaCoCo** | Cobertura de código |
| **SpotBugs** | Análisis estático — detecta bugs |
| **Checkstyle** | Estilo y convenciones |
| **Spotless** | Formateo automático |

## Instalación rápida

1. Descargá el `SKILL.md` con el botón de arriba
2. Abrí Claude Code en tu terminal
3. Adjuntá el archivo y enviá:

> *"Instalá este skill en `~/.claude/skills/java/SKILL.md`"*

## Nivel de aplicación

**Tipo:** Automático por inferencia | **Nivel:** Avanzado | **Java:** 17+ | **Lombok:** 1.18+
