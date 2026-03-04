---
name: java
description: >
  Java moderno con calidad de código, Lombok estándar y seguridad de tipos.
  Trigger: crear clase Java, refactorizar Java, escribir servicio Java, mejorar calidad Java
license: MIT
metadata:
  author: tu-proyecto
  version: '1.1'
  scope: [root]
  auto_invoke:
    - 'Crear clase Java'
    - 'Crear servicio Java'
    - 'Refactorizar Java'
    - 'Mejorar calidad Java'
    - 'Escribir código Java'
    - 'Usar Lombok'
allowed-tools: Read, Edit, Write, Glob, Grep, Bash
---

# Java Skill

## Critical Rules

### ALWAYS

- Usar Lombok como librería estándar para eliminar boilerplate
- Usar `@RequiredArgsConstructor` para inyección por constructor — nunca `@Autowired` en campo
- Usar `@Slf4j` para logging — nunca crear `Logger` manualmente
- Usar `@Builder` para construcción de objetos con más de 3 parámetros
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
- Usar `@NonNull` (Lombok) o `Objects.requireNonNull` para precondiciones de parámetros

### NEVER

- Usar `@Data` en entidades JPA — causa N+1 con lazy loading e infinite recursion en bidireccionales
- Usar `@Setter` a nivel de clase en entidades — preferir builder o métodos de dominio
- Usar `@ToString` sin `exclude` en entidades con relaciones lazy o bidireccionales
- Usar `@SneakyThrows` para ocultar excepciones que deberían manejarse
- Crear `Logger` manualmente (`LoggerFactory.getLogger(...)`) — usar `@Slf4j`
- Inyectar dependencias con `@Autowired` en campo — usar `@RequiredArgsConstructor`
- Retornar `null` — usar `Optional<T>` o lanzar excepción
- Usar raw types: `List`, `Map`, `Set` sin parámetro de tipo
- Capturar excepciones con `catch` vacío o solo con `e.printStackTrace()`
- Crear clases con más de una responsabilidad (God classes)
- Usar estado mutable estático (`static` + no-`final`)
- Comparar Strings con `==` (usar `.equals()`)
- Duplicar lógica entre clases — extraer a clase base, interfaz o utility

---

## Lombok — Librería Estándar

### Constructores

```java
// ✅ @RequiredArgsConstructor — genera constructor para campos final y @NonNull
// Es el estándar para inyección de dependencias en Spring Boot
@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;  // inyectado por constructor
    private final UserMapper     userMapper;       // inyectado por constructor
}

// ✅ @NoArgsConstructor — constructor sin argumentos
// Requerido por JPA y Jackson para deserialización
@Entity
@NoArgsConstructor   // JPA lo necesita
@AllArgsConstructor  // para tests y factory methods
public class User { ... }

// @AllArgsConstructor — todos los campos (combinar con factory method)
```

### Logging

```java
// ❌ MAL — Logger manual (boilerplate repetido en cada clase)
public class UserService {
    private static final Logger log = LoggerFactory.getLogger(UserService.class);
}

// ✅ BIEN — @Slf4j crea "log" automáticamente
@Slf4j
@Service
public class UserService {
    public void create(User user) {
        log.info("Creating user with email={}", user.getEmail());
        log.debug("Full user data: {}", user);
        log.error("Failed to create user: {}", e.getMessage(), e);
    }
}

// Para Log4j2: usar @Log4j2
```

### Getters, Setters y Equals

```java
// En entidades JPA — control granular (NUNCA @Data)
@Entity
@Getter                                   // getters en todos los campos
@Setter                                   // setters en todos los campos (o a nivel de campo)
@NoArgsConstructor
@EqualsAndHashCode(of = "id")             // solo el id define igualdad en entidades
@ToString(exclude = {"password", "orders"}) // excluir sensibles y colecciones lazy
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Setter(AccessLevel.NONE)  // campo calculado — no exponer setter
    private String slug;

    @OneToMany(fetch = FetchType.LAZY)
    @ToString.Exclude   // alternativa por campo — evita N+1 en toString
    private List<Order> orders;
}

// En DTOs simples (no entidades) — @Data está bien
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Long   id;
    private String name;
    private String email;
}
```

### Builder

```java
// ✅ @Builder — patrón builder sin escribir el builder manualmente
@Builder
@Getter
public class EmailMessage {
    private final String       to;
    private final String       subject;

    @Builder.Default  // SIN @Builder.Default el campo sería null en el builder
    private final String       body = "";

    @Builder.Default
    private final List<String> cc   = List.of();

    @Builder.Default
    private final boolean      highPriority = false;
}

// Uso — igual que builder manual pero sin el boilerplate
EmailMessage email = EmailMessage.builder()
    .to("user@example.com")
    .subject("Bienvenido")
    .body("Tu cuenta fue creada.")
    .cc(List.of("admin@example.com"))
    .build();

// @Builder(toBuilder = true) — crea copia con un campo modificado
EmailMessage reminder = email.toBuilder()
    .subject("Recordatorio: " + email.getSubject())
    .build();
```

### @SuperBuilder — Builder con Herencia

```java
// Cuando la clase padre también usa @Builder, usar @SuperBuilder en ambas
@SuperBuilder
@Getter
public abstract class BaseEntity {
    private final Long   id;
    private final String createdBy;
}

@SuperBuilder
@Getter
public class Product extends BaseEntity {
    private final String name;
    private final double price;
}

// Uso:
Product p = Product.builder()
    .id(1L)
    .createdBy("admin")
    .name("Laptop")
    .price(999.99)
    .build();
```

### @With — Copias Inmutables

```java
// En clases inmutables (alternativa a toBuilder para campos individuales):
@Value   // equivalente a @Data pero todo final (usar record en Java 16+)
@With    // genera withXxx(value) que retorna copia con ese campo cambiado
public class Config {
    int     timeout;
    boolean retryEnabled;
    int     maxRetries;
}

// Uso:
Config base    = new Config(5000, false, 0);
Config withRetry = base.withRetryEnabled(true).withMaxRetries(3);
```

### @NonNull — Validación de Parámetros

```java
import lombok.NonNull;

public class UserService {
    // Lombok lanza NullPointerException con mensaje claro si el parámetro es null
    public UserResponse create(@NonNull CreateUserRequest request) {
        // no necesita Objects.requireNonNull manual
        return userMapper.toResponse(userRepository.save(userMapper.toEntity(request)));
    }
}
```

---

## Record — DTO Inmutable (Java 16+)

```java
// ✅ BIEN — record es conciso, inmutable y genera equals/hashCode/toString
// En Java 16+, preferir record sobre @Value de Lombok
public record CreateUserRequest(
    @NotBlank  String   name,
    @Email     String   email,
    @NotNull   UserRole role
) {}

// Para respuestas con factory method desde entidad:
public record UserResponse(
    Long     id,
    String   name,
    String   email,
    UserRole role
) {
    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole());
    }
}
```

> **record vs @Value**: en Java 16+ usar `record`. Usar `@Value` solo para compatibilidad con Java < 16 o cuando se necesita herencia.

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
```

### Resultado genérico (Success / Failure)

```java
// sealed + record — discriminated union type-safe (Java 17+)
public sealed interface Result<T> permits Result.Success, Result.Failure {

    record Success<T>(T value)                         implements Result<T> {}
    record Failure<T>(String message, String code)     implements Result<T> {}

    static <T> Result<T> success(T value)                     { return new Success<>(value); }
    static <T> Result<T> failure(String message, String code) { return new Failure<>(message, code); }

    default boolean isSuccess() { return this instanceof Success<T>; }
}

// Uso con pattern matching (Java 21+):
switch (result) {
    case Result.Success<User> s -> log.info("Usuario creado: {}", s.value().getId());
    case Result.Failure<User> f -> log.error("Error {}: {}", f.code(), f.message());
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

## Service Pattern (Spring Boot + Lombok completo)

```java
@Service
@RequiredArgsConstructor   // constructor injection automático
@Slf4j                     // logger "log" disponible
@Transactional(readOnly = true)  // read-only por defecto, override en escrituras
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper     userMapper;

    public UserResponse getById(Long id) {
        return userRepository.findById(id)
            .map(userMapper::toResponse)
            .orElseThrow(() -> new EntityNotFoundException("User", id));
    }

    @Transactional    // override de readOnly — escritura
    public UserResponse create(@NonNull CreateUserRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException("Email already in use", "EMAIL_CONFLICT");
        }

        User user  = userMapper.toEntity(request);
        User saved = userRepository.save(user);
        log.info("User created id={} email={}", saved.getId(), saved.getEmail());
        return userMapper.toResponse(saved);
    }

    @Transactional
    public UserResponse update(Long id, @NonNull UpdateUserRequest request) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("User", id));

        userMapper.updateEntity(user, request);
        log.info("User updated id={}", id);
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
@Getter
public class DomainException extends RuntimeException {
    private final String code;

    public DomainException(String message, String code) {
        super(message);
        this.code = code;
    }
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
try { riskyOperation(); } catch (Exception e) { e.printStackTrace(); }

// ✅ BIEN
try {
    riskyOperation();
} catch (SpecificException e) {
    log.error("Error procesando operación: {}", e.getMessage(), e);
    throw new DomainException("Error en operación X", "OP_X_ERROR");
}
```

---

## Guard Clauses — Inputs al Inicio

```java
// ❌ MAL — lógica principal enterrada en niveles de if anidados
public void processOrder(Order order) {
    if (order != null) {
        if (order.getItems() != null && !order.getItems().isEmpty()) {
            if (order.getTotal() > 0) { /* lógica */ }
        }
    }
}

// ✅ BIEN — fail fast con @NonNull de Lombok + guard clauses
public void processOrder(@NonNull Order order) {
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
// ❌ MAL — casteo explícito
if (obj instanceof String) { String s = (String) obj; s.length(); }

// ✅ BIEN — pattern matching
if (obj instanceof String s) { s.length(); }

// ✅ MEJOR — switch expression con sealed classes (Java 21+)
String description = switch (shape) {
    case Circle    c -> "Círculo de radio " + c.radius();
    case Rectangle r -> "Rectángulo " + r.width() + "x" + r.height();
    case Triangle  t -> "Triángulo de base " + t.base();
};
```

---

## Constantes — Sin Magic Values

```java
public final class UserConstants {
    private UserConstants() {}

    public static final int      MAX_FAILED_ATTEMPTS = 5;
    public static final String   CACHE_KEY_PREFIX    = "user_";
    public static final Duration SESSION_EXPIRY      = Duration.ofHours(8);
    public static final int      MAX_NAME_LENGTH     = 100;
}
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

# Ver qué genera Lombok (delomboked)
mvn lombok:delombok
./gradlew delombok

# Ejecutar aplicación Spring Boot
mvn spring-boot:run
./gradlew bootRun
```

---

## Project-Specific Notes

Adaptá esta sección a las convenciones de tu proyecto:

- Versión de Java: 17+ (LTS recomendado) o 21+ para virtual threads y pattern matching completo
- Framework: Spring Boot 3.x / Quarkus / Micronaut / Java puro
- ORM: Spring Data JPA / Hibernate / jOOQ / JDBC Template
- **Lombok**: siempre habilitado — agregar dependencia y plugin en pom.xml / build.gradle
- Testing: JUnit 5 + Mockito + AssertJ
- Build tool: Maven o Gradle (adaptar comandos)

### Dependencia Lombok (Maven)

```xml
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <version>1.18.34</version>
    <scope>provided</scope>
</dependency>
```

### Dependencia Lombok (Gradle)

```groovy
compileOnly 'org.projectlombok:lombok:1.18.34'
annotationProcessor 'org.projectlombok:lombok:1.18.34'
// Para tests:
testCompileOnly 'org.projectlombok:lombok:1.18.34'
testAnnotationProcessor 'org.projectlombok:lombok:1.18.34'
```
