---
id: netcore-skill
title: "Claude Skill: NetCore moderno"
sidebar_label: "NetCore Skill"
---

# Claude Skill: NetCore moderno

Skill que guía a Claude para escribir **.NET/C# moderno con primary constructors, null safety y patrones idiomáticos**, aplicando `ILogger<T>`, `record`, LINQ, pattern matching, async/await correcto, guard clauses y una jerarquía de excepciones bien definida.

:::tip Descarga el skill
<a href="/flock-tech-guides/skills/netcore/SKILL.md" download="SKILL.md">⬇ Descargar SKILL.md</a> — guardalo en `~/.claude/skills/netcore/SKILL.md` para instalarlo directamente.
:::

## ¿Qué hace?

Cuando Claude escribe o refactoriza código C#/.NET, este skill le indica:

- Usar **primary constructors** (C# 12) para inyección de dependencias — sin campos privados repetitivos
- Usar **`ILogger<T>`** vía DI para logging estructurado — nunca `Console.WriteLine`
- Usar **`record`** para DTOs inmutables con equals/hashCode/toString automáticos
- Habilitar **nullable reference types** y usar `ArgumentNullException.ThrowIfNull` para null safety
- **Anti-duplicación** con generics: `PaginatedResponse<T>`, `Result<T>`
- Usar **LINQ** para procesar colecciones en vez de loops imperativos
- Aplicar **pattern matching** con `is`, `switch` expressions y `when` guards (C# 8+)
- Usar **`async/await`** correctamente — nunca `.Result` ni `.Wait()` en async contexts
- Definir **jerarquía de excepciones propia** — nunca `catch (Exception e)` silencioso
- Aplicar **guard clauses** para validar inputs al inicio del método
- Extraer constantes nombradas — sin magic numbers ni magic strings

## ¿Cuándo se activa?

Claude lo invoca automáticamente al detectar:

> *"Crear clase C#"*, *"Crear servicio .NET"*, *"Refactorizar C#"*, *"Mejorar calidad .NET"*, *"Escribir código NetCore"*, *"Crear controller"*, *"Crear endpoint"*

## Primary Constructors como estándar

Los primary constructors (C# 12) eliminan el boilerplate de declarar campos privados y un constructor explícito. El skill los usa para todos los servicios:

| Patrón | Descripción | Cuándo usar |
|---|---|---|
| `class Service(IDep dep)` | Constructor primario sin campo privado | **Siempre** en servicios — inyección por constructor |
| `ILogger<T>` en constructor | Logger tipado vía DI | **Siempre** — nunca `Console.WriteLine` |
| `record Dto(Type Prop)` | DTO inmutable con deconstrucción | Requests, Responses, Events |
| `record Result<T>` | Unión discriminada type-safe | Operaciones que pueden fallar |
| `PaginatedResponse<T>` | Respuesta paginada reutilizable | Endpoints con paginación |

### Antipatrones en inyección de dependencias

```csharp
// ❌ MAL — campo privado + constructor manual = boilerplate
public class UserService
{
    private readonly IUserRepository _repo;
    private readonly ILogger<UserService> _logger;

    public UserService(IUserRepository repo, ILogger<UserService> logger)
    {
        _repo = repo;
        _logger = logger;
    }
}

// ✅ BIEN — primary constructor (C# 12)
public class UserService(IUserRepository repo, ILogger<UserService> logger)
{
    // repo y logger disponibles directamente
}
```

## Reglas de calidad

| Regla | Descripción |
|---|---|
| **`ILogger<T>` obligatorio** | Nunca `Console.WriteLine` en producción |
| **Primary constructor** | Nunca campo privado + constructor manual cuando hay primary constructor |
| **`ArgumentNullException.ThrowIfNull`** | Guard clause idiomática antes de la lógica |
| **Sin `.Result` ni `.Wait()`** | Nunca bloquear en contextos async — causa deadlocks |
| **Sin `null` como retorno** | Usar `Result<T>` o lanzar excepción específica |
| **Sin raw generics** | `List<string>` no `ArrayList`, tipos genéricos siempre tipados |
| **Sin catch vacíos** | Siempre loggear + relanzar o convertir a excepción de dominio |
| **Sin God Classes** | Clases < 200 líneas, métodos < 20 líneas |
| **Sin magic values** | Extraer a constantes nombradas |

## Patrones principales

### Servicio ASP.NET Core con primary constructor

```csharp
public class UserService(
    IUserRepository userRepository,
    ILogger<UserService> logger)
{
    public async Task<UserResponse> GetByIdAsync(int id)
    {
        var user = await userRepository.GetByIdAsync(id)
            ?? throw new EntityNotFoundException(nameof(User), id);
        return UserResponse.From(user);
    }

    public async Task<UserResponse> CreateAsync(CreateUserRequest request)
    {
        ArgumentNullException.ThrowIfNull(request);

        if (await userRepository.ExistsByEmailAsync(request.Email))
            throw new ConflictException($"Email {request.Email} already in use", "EMAIL_CONFLICT");

        var user = new User { Name = request.Name, Email = request.Email };
        await userRepository.AddAsync(user);

        logger.LogInformation("User created id={Id} email={Email}", user.Id, user.Email);
        return UserResponse.From(user);
    }
}
```

### Record — DTO inmutable

```csharp
public record CreateUserRequest(
    [Required] string Name,
    [EmailAddress] string Email
);

public record UserResponse(int Id, string Name, string Email)
{
    public static UserResponse From(User user) =>
        new(user.Id, user.Name, user.Email);
}
```

### Nullable Reference Types — Null Safety

```csharp
// Lanzar excepción si no existe:
public async Task<User> GetByIdAsync(int id) =>
    await _repo.FindByIdAsync(id)
        ?? throw new EntityNotFoundException(nameof(User), id);

// Guard clause idiomática:
ArgumentNullException.ThrowIfNull(request);
```

### Pattern Matching — Sin Casteos

```csharp
string description = shape switch
{
    Circle    c when c.Radius > 10 => $"Círculo grande (r={c.Radius})",
    Circle    c                    => $"Círculo pequeño (r={c.Radius})",
    Rectangle { Width: var w, Height: var h } => $"Rectángulo {w}x{h}",
    _                              => "Forma desconocida"
};
```

## Cobertura de herramientas

| Herramienta | Propósito |
|---|---|
| **Microsoft.CodeAnalysis.NetAnalyzers** | Análisis estático incluido en .NET 5+ |
| **xUnit** | Tests unitarios y de integración |
| **Moq** | Mocks y stubs |
| **FluentAssertions** | Assertions legibles y expresivas |
| **Coverlet** | Cobertura de código |
| **dotnet format** | Formateo automático de código |
| **SonarLint** | Análisis en tiempo real en el IDE |

## Instalación rápida

1. Descargá el `SKILL.md` con el botón de arriba
2. Abrí Claude Code en tu terminal
3. Adjuntá el archivo y enviá:

> *"Instalá este skill en `~/.claude/skills/netcore/SKILL.md`"*

## Nivel de aplicación

**Tipo:** Automático por inferencia | **Nivel:** Avanzado | **.NET:** 8+ | **C#:** 12+
