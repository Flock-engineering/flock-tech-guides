---
name: java
description: >
  Java moderno con calidad de código, sin duplicación y seguridad de tipos.
  Trigger: crear clase Java, refactorizar Java, escribir servicio Java, mejorar calidad Java
license: MIT
metadata:
  author: tu-proyecto
  version: '1.0'
  scope: [root]
  auto_invoke:
    - 'Crear clase Java'
    - 'Crear servicio Java'
    - 'Refactorizar Java'
    - 'Mejorar calidad Java'
    - 'Escribir código Java'
allowed-tools: Read, Edit, Write, Glob, Grep, Bash
---

# Java Skill

## Critical Rules

### ALWAYS

- Usar `Optional<T>` como retorno en lugar de `null`
- Aplicar Single Responsibility: clases < 200 líneas, métodos < 20 líneas
- Declarar campos inmutables con `final`
- Usar `record` para objetos de datos inmutables (Java 16+)
- Usar generics con tipo explícito — nunca raw types (`List` → `List<String>`)
- Extraer constantes: no magic numbers ni magic strings en la lógica
- Usar guard clauses para validar inputs al inicio del método
- Preferir composición sobre herencia
- Usar streams para procesar colecciones en vez de loops imperativos
- Usar pattern matching con `instanceof` (Java 16+) en vez de casteos explícitos
- Lanzar excepciones específicas y documentadas, nunca `Exception` o `Throwable` genéricos
- Usar `Objects.requireNonNull` para precondiciones de parámetros

### NEVER

- Retornar `null` — usar `Optional<T>` o lanzar excepción
- Usar raw types: `List`, `Map`, `Set` sin parámetro de tipo
- Capturar excepciones con bloque `catch` vacío o solo con `e.printStackTrace()`
- Crear clases con más de una responsabilidad (God classes)
- Usar estado mutable estático (`static` + no-final)
- Comparar Strings con `==` (usar `.equals()`)
- Usar `instanceof` + casteo explícito sin pattern matching
- Ignorar el resultado de operaciones que retornan valor (ej: `String.replace`)
- Duplicar lógica entre clases — extraer a clase base, interfaz o utility

---

## Record — DTO Inmutable (Java 16+)

```java
// ✅ BIEN — record es conciso, inmutable y genera equals/hashCode/toString
public record CreateUserRequest(
    @NotBlank  String   name,
    @Email     String   email,
    @NotNull   UserRole role
) {}

// Para respuestas:
public record UserResponse(
    Long     id,
    String   name,
    String   email,
    UserRole role
) {
    // Factory method desde entidad — evita duplicar mapping en múltiples lugares
    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole());
    }
}
```

---

## Optional — Null Safety

```java
// ❌ MAL — retornar null obliga al caller a chequear
public User findById(Long id) {
    return userRepository.findById(id).orElse(null);
}

// ✅ BIEN — Optional comunica explícitamente que puede no existir
public Optional<User> findById(Long id) {
    return userRepository.findById(id);
}

// ✅ BIEN — lanzar excepción específica cuando el elemento es requerido
public User getById(Long id) {
    return userRepository.findById(id)
        .orElseThrow(() -> new EntityNotFoundException("User", id));
}

// Encadenado seguro:
String email = userRepository.findById(id)
    .map(User::getEmail)
    .map(String::toLowerCase)
    .orElse("sin-email@default.com");
```

---

## Generics — Sin Duplicación

### Respuesta paginada genérica

```java
// ✅ Una sola definición — usada en todos los módulos
public record PaginatedResponse<T>(
    List<T> content,
    int     page,
    int     size,
    long    totalElements,
    int     totalPages
) {
    // Convierte desde Page de Spring Data — evita repetir el mapeo
    public static <T> PaginatedResponse<T> from(Page<T> page) {
        return new PaginatedResponse<>(
            page.getContent(),
            page.getNumber(),
            page.getSize(),
            page.getTotalElements(),
            page.getTotalPages()
        );
    }
}

// Uso:
PaginatedResponse<UserResponse> response = PaginatedResponse.from(usersPage);
```

### Resultado genérico (Success / Failure)

```java
// sealed + record — discriminated union type-safe (Java 17+)
public sealed interface Result<T> permits Result.Success, Result.Failure {

    record Success<T>(T value) implements Result<T> {}
    record Failure<T>(String message, String code) implements Result<T> {}

    static <T> Result<T> success(T value)                      { return new Success<>(value); }
    static <T> Result<T> failure(String message, String code)  { return new Failure<>(message, code); }

    default boolean isSuccess() { return this instanceof Success<T>; }
}

// Uso con pattern matching:
switch (result) {
    case Result.Success<User> s  -> log.info("Usuario creado: {}", s.value().getId());
    case Result.Failure<User> f  -> log.error("Error {}: {}", f.code(), f.message());
}
```

### Repositorio base genérico

```java
public interface BaseRepository<T, ID> {
    Optional<T>  findById(ID id);
    List<T>      findAll();
    Page<T>      findAll(Pageable pageable);
    T            save(T entity);
    void         deleteById(ID id);
    boolean      existsById(ID id);
}
```

---

## Service Pattern (Spring Boot)

```java
@Service
@RequiredArgsConstructor   // Lombok — constructor injection sin boilerplate
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper     userMapper;

    public UserResponse getById(Long id) {
        return userRepository.findById(id)
            .map(userMapper::toResponse)
            .orElseThrow(() -> new EntityNotFoundException("User", id));
    }

    @Transactional
    public UserResponse create(CreateUserRequest request) {
        // Guard clause — validar precondición al inicio
        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException("Email already in use", "EMAIL_CONFLICT");
        }

        User user = userMapper.toEntity(request);
        User saved = userRepository.save(user);
        log.info("User created with id={}", saved.getId());
        return userMapper.toResponse(saved);
    }

    @Transactional
    public UserResponse update(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("User", id));

        userMapper.updateEntity(user, request);  // mutación controlada en el mapper
        return userMapper.toResponse(userRepository.save(user));
    }
}
```

---

## Streams — Collections sin Loops Imperativos

```java
// ❌ MAL — loop imperativo
List<String> emails = new ArrayList<>();
for (User user : users) {
    if (user.isActive()) {
        emails.add(user.getEmail().toLowerCase());
    }
}

// ✅ BIEN — stream declarativo
List<String> emails = users.stream()
    .filter(User::isActive)
    .map(User::getEmail)
    .map(String::toLowerCase)
    .collect(Collectors.toList());

// Agrupar:
Map<UserRole, List<User>> byRole = users.stream()
    .collect(Collectors.groupingBy(User::getRole));

// Reducir:
OptionalDouble avgAge = users.stream()
    .mapToInt(User::getAge)
    .average();

// Verificar condición:
boolean allActive = users.stream().allMatch(User::isActive);
boolean anyAdmin  = users.stream().anyMatch(u -> u.getRole() == UserRole.ADMIN);
```

---

## Exception Hierarchy — Sin Capturar Genéricos

```java
// Jerarquía propia — evita lanzar/capturar Exception genérico
public class DomainException extends RuntimeException {
    private final String code;

    public DomainException(String message, String code) {
        super(message);
        this.code = code;
    }

    public String getCode() { return code; }
}

public class EntityNotFoundException extends DomainException {
    public EntityNotFoundException(String entity, Object id) {
        super(entity + " with id " + id + " not found", entity.toUpperCase() + "_NOT_FOUND");
    }
}

public class ConflictException extends DomainException {
    public ConflictException(String message, String code) {
        super(message, code);
    }
}

// ❌ MAL
try {
    riskyOperation();
} catch (Exception e) {       // captura todo — oculta bugs
    e.printStackTrace();
}

// ✅ BIEN
try {
    riskyOperation();
} catch (SpecificException e) {
    log.error("Error procesando: {}", e.getMessage(), e);
    throw new DomainException("Error en operación X", "OP_X_ERROR");
}
```

---

## Guard Clauses — Inputs al Inicio

```java
// ❌ MAL — lógica anidada, difícil de leer
public void processOrder(Order order) {
    if (order != null) {
        if (order.getItems() != null && !order.getItems().isEmpty()) {
            if (order.getTotal() > 0) {
                // lógica principal enterrada en niveles
            }
        }
    }
}

// ✅ BIEN — fail fast, lógica principal al nivel 0
public void processOrder(Order order) {
    Objects.requireNonNull(order, "Order cannot be null");
    if (order.getItems() == null || order.getItems().isEmpty()) {
        throw new IllegalArgumentException("Order must have at least one item");
    }
    if (order.getTotal() <= 0) {
        throw new IllegalArgumentException("Order total must be positive");
    }

    // lógica principal sin anidación
}
```

---

## Pattern Matching — Sin Casteos (Java 16+)

```java
// ❌ MAL — casteo explícito propenso a errores
if (obj instanceof String) {
    String s = (String) obj;
    System.out.println(s.length());
}

// ✅ BIEN — pattern matching con instanceof
if (obj instanceof String s) {
    System.out.println(s.length());
}

// ✅ MEJOR — switch expression (Java 21+)
String description = switch (shape) {
    case Circle    c -> "Círculo de radio " + c.radius();
    case Rectangle r -> "Rectángulo " + r.width() + "x" + r.height();
    case Triangle  t -> "Triángulo de base " + t.base();
    // compilador verifica exhaustividad con sealed classes
};
```

---

## Constantes — Sin Magic Values

```java
// ❌ MAL — magic numbers/strings en la lógica
if (user.getFailedAttempts() > 5) { ... }
String cacheKey = "user_" + id;

// ✅ BIEN — constantes nombradas
public final class UserConstants {
    private UserConstants() {} // prevenir instanciación

    public static final int      MAX_FAILED_ATTEMPTS  = 5;
    public static final String   CACHE_KEY_PREFIX     = "user_";
    public static final Duration SESSION_EXPIRY       = Duration.ofHours(8);
    public static final int      MAX_NAME_LENGTH      = 100;
}

// Uso:
if (user.getFailedAttempts() > UserConstants.MAX_FAILED_ATTEMPTS) { ... }
String cacheKey = UserConstants.CACHE_KEY_PREFIX + id;
```

---

## Builder Pattern (sin Lombok)

```java
// Cuando record no alcanza (objeto mutable o con validación compleja):
public class EmailMessage {
    private final String to;
    private final String subject;
    private final String body;
    private final List<String> cc;

    private EmailMessage(Builder builder) {
        this.to      = Objects.requireNonNull(builder.to,      "to is required");
        this.subject = Objects.requireNonNull(builder.subject, "subject is required");
        this.body    = builder.body;
        this.cc      = List.copyOf(builder.cc);  // copia inmutable
    }

    public static Builder builder(String to, String subject) {
        return new Builder(to, subject);
    }

    public static final class Builder {
        private final String       to;
        private final String       subject;
        private       String       body = "";
        private       List<String> cc   = List.of();

        private Builder(String to, String subject) {
            this.to      = to;
            this.subject = subject;
        }

        public Builder body(String body)    { this.body = body; return this; }
        public Builder cc(List<String> cc)  { this.cc   = cc;   return this; }
        public EmailMessage build()         { return new EmailMessage(this); }
    }
}

// Uso (con Lombok @Builder es equivalente):
EmailMessage email = EmailMessage.builder("user@example.com", "Bienvenido")
    .body("Hola, tu cuenta fue creada.")
    .cc(List.of("admin@example.com"))
    .build();
```

---

## Commands

```bash
# Compilar
mvn compile
./gradlew compileJava

# Tests
mvn test
./gradlew test

# Tests con reporte de cobertura (JaCoCo)
mvn verify
./gradlew jacocoTestReport

# Análisis estático (SpotBugs)
mvn spotbugs:check
./gradlew spotbugsMain

# Checkstyle (estilo de código)
mvn checkstyle:check
./gradlew checkstyleMain

# Formateo automático (Spotless)
mvn spotless:apply
./gradlew spotlessApply

# Ver dependencias desactualizadas
mvn versions:display-dependency-updates
./gradlew dependencyUpdates

# Ejecutar aplicación Spring Boot
mvn spring-boot:run
./gradlew bootRun
```

---

## Project-Specific Notes

Adaptá esta sección a las convenciones de tu proyecto:

- Versión de Java: 17+ (LTS recomendado) o 21+ para virtual threads
- Framework: Spring Boot 3.x / Quarkus / Micronaut / Java puro
- ORM: Spring Data JPA / Hibernate / jOOQ / JDBC Template
- Lombok habilitado: `@RequiredArgsConstructor`, `@Slf4j`, `@Builder`, `@Value`
- Testing: JUnit 5 + Mockito + AssertJ
- Build tool: Maven o Gradle (adaptar comandos)
