# Auth + User CRUD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack auth + user CRUD app with React 18 + Vite frontend and .NET 8 Clean Architecture backend using SQL Server in Docker.

**Architecture:** Three-project .NET solution (Api / Application / Infrastructure) connected to SQL Server via EF Core. React SPA with AuthContext + Axios interceptor for transparent token refresh. JWT access tokens (30 min) + DB-stored refresh tokens (7 days).

**Tech Stack:** .NET 8, EF Core 8, BCrypt.Net-Next, System.IdentityModel.Tokens.Jwt, Serilog, xUnit, Moq — React 18, Vite, react-hook-form, react-router-dom v6, Axios, Vitest, @testing-library/react

> **Hard rule — no Claude or AI references anywhere in the deliverable:**
> Every commit message, code comment, README line, Swagger description, and file header must read as written by the candidate. Do NOT add `Co-Authored-By: Claude` or any similar tag to any commit. Do not mention Claude, Anthropic, or any AI tool anywhere in the submitted repository.

---

## File Map

```
/
├── docker-compose.yml
├── .gitignore
├── README.md
├── backend/
│   ├── UserApp.sln
│   ├── UserApp.Api/
│   │   ├── Controllers/AuthController.cs
│   │   ├── Controllers/UsersController.cs
│   │   ├── Filters/GlobalExceptionFilter.cs
│   │   ├── Program.cs
│   │   └── appsettings.json
│   ├── UserApp.Application/
│   │   ├── DTOs/Auth/RegisterDto.cs
│   │   ├── DTOs/Auth/LoginDto.cs
│   │   ├── DTOs/Auth/LoginResponseDto.cs
│   │   ├── DTOs/Auth/RefreshDto.cs
│   │   ├── DTOs/Users/UserDto.cs
│   │   ├── DTOs/Users/CreateUserDto.cs
│   │   ├── DTOs/Users/UpdateUserDto.cs
│   │   ├── DTOs/Common/PagedResult.cs
│   │   ├── Entities/User.cs
│   │   ├── Entities/RefreshToken.cs
│   │   ├── Exceptions/ConflictException.cs
│   │   ├── Exceptions/ForbiddenException.cs
│   │   ├── Exceptions/NotFoundException.cs
│   │   ├── Exceptions/UnauthorizedException.cs
│   │   ├── Interfaces/IAuthService.cs
│   │   ├── Interfaces/IUserService.cs
│   │   ├── Interfaces/IUserRepository.cs
│   │   ├── Interfaces/IRefreshTokenRepository.cs
│   │   ├── Interfaces/ITokenService.cs
│   │   ├── Interfaces/IPasswordService.cs
│   │   ├── Services/AuthService.cs
│   │   └── Services/UserService.cs
│   ├── UserApp.Infrastructure/
│   │   ├── Data/AppDbContext.cs
│   │   ├── Data/DataSeeder.cs
│   │   ├── Repositories/UserRepository.cs
│   │   ├── Repositories/RefreshTokenRepository.cs
│   │   ├── Services/PasswordService.cs
│   │   └── Services/TokenService.cs
│   └── UserApp.Tests/
│       ├── Services/PasswordServiceTests.cs
│       ├── Services/TokenServiceTests.cs
│       ├── Services/AuthServiceTests.cs
│       └── Services/UserServiceTests.cs
└── frontend/
    ├── package.json
    ├── vite.config.ts
    ├── .env.example
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── setupTests.ts
        ├── api/axiosInstance.ts
        ├── context/AuthContext.tsx
        ├── components/Layout.tsx
        ├── components/PrivateRoute.tsx
        ├── components/AdminRoute.tsx
        ├── pages/LoginPage.tsx
        ├── pages/RegisterPage.tsx
        ├── pages/UsersPage.tsx
        ├── pages/UserFormPage.tsx
        ├── pages/ProfilePage.tsx
        └── __tests__/LoginPage.test.tsx
```

---

## Phase 1: Foundation

### Task 1: Repository & Docker setup

**Files:**
- Create: `docker-compose.yml`
- Create: `.gitignore`

- [ ] **Step 1: Create `.gitignore`**

```
# .gitignore
## .NET
backend/**/bin/
backend/**/obj/
backend/**/*.user
backend/**/appsettings.*.json
!backend/**/appsettings.json

## Secrets
.env
.env.*
!.env.example

## Node
frontend/node_modules/
frontend/dist/

## Logs
logs/

## Superpowers
.superpowers/

## OS
.DS_Store
```

- [ ] **Step 2: Create `docker-compose.yml`**

```yaml
version: '3.8'
services:
  sqlserver:
    image: mcr.microsoft.com/mssql/server:2022-latest
    environment:
      ACCEPT_EULA: "Y"
      SA_PASSWORD: "YourStrong@Password123"
      MSSQL_MEMORY_LIMIT_MB: "512"
    ports:
      - "1433:1433"
    volumes:
      - sqldata:/var/lib/mssql/data

volumes:
  sqldata:
```

- [ ] **Step 3: Start SQL Server**

```bash
docker compose up -d
```

Expected: container starts and becomes healthy within ~30 seconds.

- [ ] **Step 4: Verify SQL Server is up**

```bash
docker compose ps
```

Expected: `sqlserver` shows `running`.

- [ ] **Step 5: Commit**

```bash
git init
git add .gitignore docker-compose.yml
git commit -m "chore: initial repo setup with Docker SQL Server"
```

---

### Task 2: .NET solution structure

**Files:**
- Create: `backend/UserApp.sln` and four projects

- [ ] **Step 1: Create the solution and projects**

```bash
cd backend
dotnet new sln -n UserApp
dotnet new webapi -n UserApp.Api --framework net8.0
dotnet new classlib -n UserApp.Application --framework net8.0
dotnet new classlib -n UserApp.Infrastructure --framework net8.0
dotnet new xunit -n UserApp.Tests --framework net8.0
```

- [ ] **Step 2: Add projects to solution**

```bash
dotnet sln add UserApp.Api/UserApp.Api.csproj
dotnet sln add UserApp.Application/UserApp.Application.csproj
dotnet sln add UserApp.Infrastructure/UserApp.Infrastructure.csproj
dotnet sln add UserApp.Tests/UserApp.Tests.csproj
```

- [ ] **Step 3: Wire project references**

```bash
dotnet add UserApp.Api/UserApp.Api.csproj reference UserApp.Application/UserApp.Application.csproj
dotnet add UserApp.Api/UserApp.Api.csproj reference UserApp.Infrastructure/UserApp.Infrastructure.csproj
dotnet add UserApp.Application/UserApp.Application.csproj reference UserApp.Infrastructure/UserApp.Infrastructure.csproj
dotnet add UserApp.Tests/UserApp.Tests.csproj reference UserApp.Application/UserApp.Application.csproj
dotnet add UserApp.Tests/UserApp.Tests.csproj reference UserApp.Infrastructure/UserApp.Infrastructure.csproj
```

- [ ] **Step 4: Add NuGet packages**

```bash
# Infrastructure
dotnet add UserApp.Infrastructure/UserApp.Infrastructure.csproj package Microsoft.EntityFrameworkCore.SqlServer
dotnet add UserApp.Infrastructure/UserApp.Infrastructure.csproj package Microsoft.EntityFrameworkCore.Design
dotnet add UserApp.Infrastructure/UserApp.Infrastructure.csproj package BCrypt.Net-Next
dotnet add UserApp.Infrastructure/UserApp.Infrastructure.csproj package System.IdentityModel.Tokens.Jwt
dotnet add UserApp.Infrastructure/UserApp.Infrastructure.csproj package Microsoft.Extensions.Configuration.Abstractions

# Api
dotnet add UserApp.Api/UserApp.Api.csproj package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add UserApp.Api/UserApp.Api.csproj package Swashbuckle.AspNetCore
dotnet add UserApp.Api/UserApp.Api.csproj package Serilog.AspNetCore
dotnet add UserApp.Api/UserApp.Api.csproj package Serilog.Sinks.File

# Tests
dotnet add UserApp.Tests/UserApp.Tests.csproj package Moq
dotnet add UserApp.Tests/UserApp.Tests.csproj package FluentAssertions
dotnet add UserApp.Tests/UserApp.Tests.csproj package Microsoft.Extensions.Configuration
dotnet add UserApp.Tests/UserApp.Tests.csproj package Microsoft.Extensions.Configuration.Memory
```

- [ ] **Step 5: Delete boilerplate files**

```bash
rm -f UserApp.Api/WeatherForecast.cs UserApp.Api/Controllers/WeatherForecastController.cs
rm -f UserApp.Application/Class1.cs UserApp.Infrastructure/Class1.cs
```

- [ ] **Step 6: Verify solution builds**

```bash
dotnet build UserApp.sln
```

Expected: `Build succeeded.`

- [ ] **Step 7: Commit**

```bash
cd ..
git add backend/
git commit -m "chore: scaffold .NET 8 Clean Architecture solution"
```

---

### Task 3: Entities, DTOs, interfaces, and exceptions

**Files:**
- Create: all files in `UserApp.Application/`

- [ ] **Step 1: Create entities**

`backend/UserApp.Application/Entities/User.cs`:
```csharp
namespace UserApp.Application.Entities;

public class User
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Role { get; set; } = "user";
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
```

`backend/UserApp.Application/Entities/RefreshToken.cs`:
```csharp
namespace UserApp.Application.Entities;

public class RefreshToken
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public DateTime? RevokedAt { get; set; }
    public DateTime CreatedAt { get; set; }
}
```

- [ ] **Step 2: Create custom exceptions**

`backend/UserApp.Application/Exceptions/ConflictException.cs`:
```csharp
namespace UserApp.Application.Exceptions;
public class ConflictException(string message) : Exception(message);
```

`backend/UserApp.Application/Exceptions/UnauthorizedException.cs`:
```csharp
namespace UserApp.Application.Exceptions;
public class UnauthorizedException(string message) : Exception(message);
```

`backend/UserApp.Application/Exceptions/ForbiddenException.cs`:
```csharp
namespace UserApp.Application.Exceptions;
public class ForbiddenException(string message) : Exception(message);
```

`backend/UserApp.Application/Exceptions/NotFoundException.cs`:
```csharp
namespace UserApp.Application.Exceptions;
public class NotFoundException(string message) : Exception(message);
```

- [ ] **Step 3: Create DTOs**

`backend/UserApp.Application/DTOs/Auth/RegisterDto.cs`:
```csharp
using System.ComponentModel.DataAnnotations;
namespace UserApp.Application.DTOs.Auth;

public class RegisterDto
{
    [Required][MaxLength(150)]
    public string Name { get; init; } = string.Empty;

    [Required][EmailAddress]
    public string Email { get; init; } = string.Empty;

    [Required][MinLength(8)]
    public string Password { get; init; } = string.Empty;
}
```

`backend/UserApp.Application/DTOs/Auth/LoginDto.cs`:
```csharp
using System.ComponentModel.DataAnnotations;
namespace UserApp.Application.DTOs.Auth;

public class LoginDto
{
    [Required][EmailAddress]
    public string Email { get; init; } = string.Empty;

    [Required]
    public string Password { get; init; } = string.Empty;
}
```

`backend/UserApp.Application/DTOs/Auth/LoginResponseDto.cs`:
```csharp
namespace UserApp.Application.DTOs.Auth;
public record LoginResponseDto(string AccessToken, string RefreshToken, UserResponseDto User);

public record UserResponseDto(Guid Id, string Name, string Email, string Role);
```

`backend/UserApp.Application/DTOs/Auth/RefreshDto.cs`:
```csharp
using System.ComponentModel.DataAnnotations;
namespace UserApp.Application.DTOs.Auth;

public class RefreshDto
{
    [Required]
    public string RefreshToken { get; init; } = string.Empty;
}
```

`backend/UserApp.Application/DTOs/Users/UserDto.cs`:
```csharp
namespace UserApp.Application.DTOs.Users;
public record UserDto(Guid Id, string Name, string Email, string Role, bool IsActive, DateTime CreatedAt);
```

`backend/UserApp.Application/DTOs/Users/CreateUserDto.cs`:
```csharp
using System.ComponentModel.DataAnnotations;
namespace UserApp.Application.DTOs.Users;

public class CreateUserDto
{
    [Required][MaxLength(150)]
    public string Name { get; init; } = string.Empty;

    [Required][EmailAddress]
    public string Email { get; init; } = string.Empty;

    [Required][MinLength(8)]
    public string Password { get; init; } = string.Empty;

    [Required]
    public string Role { get; init; } = "user";
}
```

`backend/UserApp.Application/DTOs/Users/UpdateUserDto.cs`:
```csharp
using System.ComponentModel.DataAnnotations;
namespace UserApp.Application.DTOs.Users;

public class UpdateUserDto
{
    [Required][MaxLength(150)]
    public string Name { get; init; } = string.Empty;

    [EmailAddress]
    public string? Email { get; init; }

    public string? Role { get; init; }

    [MinLength(8)]
    public string? Password { get; init; }
}
```

`backend/UserApp.Application/DTOs/Common/PagedResult.cs`:
```csharp
namespace UserApp.Application.DTOs.Common;
public record PagedResult<T>(IEnumerable<T> Items, int TotalCount, int Page, int Size);
```

- [ ] **Step 4: Create interfaces**

`backend/UserApp.Application/Interfaces/IPasswordService.cs`:
```csharp
namespace UserApp.Application.Interfaces;
public interface IPasswordService
{
    string Hash(string password);
    bool Verify(string password, string hash);
}
```

`backend/UserApp.Application/Interfaces/ITokenService.cs`:
```csharp
namespace UserApp.Application.Interfaces;
public interface ITokenService
{
    string GenerateAccessToken(Guid userId, string role);
    string GenerateRefreshToken();
}
```

`backend/UserApp.Application/Interfaces/IUserRepository.cs`:
```csharp
using UserApp.Application.Entities;
namespace UserApp.Application.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(Guid id);
    Task<User?> GetByEmailAsync(string email);
    Task<(IEnumerable<User> Items, int Total)> GetPagedAsync(string? search, int page, int size);
    Task AddAsync(User user);
    Task UpdateAsync(User user);
    Task SaveChangesAsync();
}
```

`backend/UserApp.Application/Interfaces/IRefreshTokenRepository.cs`:
```csharp
using UserApp.Application.Entities;
namespace UserApp.Application.Interfaces;

public interface IRefreshTokenRepository
{
    Task<RefreshToken?> GetByTokenAsync(string token);
    Task AddAsync(RefreshToken token);
    Task UpdateAsync(RefreshToken token);
    Task SaveChangesAsync();
}
```

`backend/UserApp.Application/Interfaces/IAuthService.cs`:
```csharp
using UserApp.Application.DTOs.Auth;
namespace UserApp.Application.Interfaces;

public interface IAuthService
{
    Task<LoginResponseDto> RegisterAsync(RegisterDto dto);
    Task<LoginResponseDto> LoginAsync(LoginDto dto);
    Task<LoginResponseDto> RefreshAsync(string refreshToken);
    Task LogoutAsync(string refreshToken);
}
```

`backend/UserApp.Application/Interfaces/IUserService.cs`:
```csharp
using UserApp.Application.DTOs.Common;
using UserApp.Application.DTOs.Users;
namespace UserApp.Application.Interfaces;

public interface IUserService
{
    Task<PagedResult<UserDto>> GetAllAsync(string? search, int page, int size);
    Task<UserDto> GetByIdAsync(Guid id, Guid requesterId, string requesterRole);
    Task<UserDto> CreateAsync(CreateUserDto dto);
    Task<UserDto> UpdateAsync(Guid id, UpdateUserDto dto, Guid requesterId, string requesterRole);
    Task DeleteAsync(Guid id);
}
```

- [ ] **Step 5: Verify build**

```bash
cd backend && dotnet build UserApp.sln
```

Expected: `Build succeeded.`

- [ ] **Step 6: Commit**

```bash
cd ..
git add backend/UserApp.Application/
git commit -m "feat: add entities, DTOs, interfaces, and exceptions"
```

---

## Phase 2: Infrastructure

### Task 4: EF Core DbContext, migrations, and seeder

**Files:**
- Create: `UserApp.Infrastructure/Data/AppDbContext.cs`
- Create: `UserApp.Infrastructure/Data/DataSeeder.cs`

- [ ] **Step 1: Create `AppDbContext.cs`**

`backend/UserApp.Infrastructure/Data/AppDbContext.cs`:
```csharp
using Microsoft.EntityFrameworkCore;
using UserApp.Application.Entities;

namespace UserApp.Infrastructure.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(e =>
        {
            e.HasKey(u => u.Id);
            e.HasIndex(u => u.Email).IsUnique();
            e.Property(u => u.Email).HasMaxLength(256).IsRequired();
            e.Property(u => u.PasswordHash).IsRequired();
            e.Property(u => u.Name).HasMaxLength(150).IsRequired();
            e.Property(u => u.Role).HasMaxLength(20).IsRequired().HasDefaultValue("user");
            e.Property(u => u.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
        });

        modelBuilder.Entity<RefreshToken>(e =>
        {
            e.HasKey(r => r.Id);
            e.HasIndex(r => r.Token).IsUnique();
            e.Property(r => r.Token).HasMaxLength(512).IsRequired();
            e.Property(r => r.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            e.HasOne<User>()
             .WithMany()
             .HasForeignKey(r => r.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
```

- [ ] **Step 2: Create `DataSeeder.cs`**

`backend/UserApp.Infrastructure/Data/DataSeeder.cs`:
```csharp
using Microsoft.EntityFrameworkCore;
using UserApp.Application.Entities;
using UserApp.Application.Interfaces;

namespace UserApp.Infrastructure.Data;

public static class DataSeeder
{
    public static async Task SeedAsync(AppDbContext db, IPasswordService passwordService)
    {
        if (await db.Users.AnyAsync()) return;

        db.Users.AddRange(
            new User
            {
                Id = Guid.NewGuid(),
                Name = "Admin",
                Email = "admin@demo.com",
                PasswordHash = passwordService.Hash("Admin123!"),
                Role = "admin",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new User
            {
                Id = Guid.NewGuid(),
                Name = "Demo User",
                Email = "user@demo.com",
                PasswordHash = passwordService.Hash("User123!"),
                Role = "user",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            }
        );

        await db.SaveChangesAsync();
    }
}
```

- [ ] **Step 3: Add EF Core design tool and create migration**

```bash
cd backend
dotnet tool install --global dotnet-ef
dotnet ef migrations add InitialCreate --project UserApp.Infrastructure/UserApp.Infrastructure.csproj --startup-project UserApp.Api/UserApp.Api.csproj
```

Expected: `Migrations/` folder appears in `UserApp.Infrastructure` with the initial migration file.

Note: This step requires `Program.cs` to already have `AddDbContext` registered. If it fails, come back after Task 11 and run this step then.

- [ ] **Step 4: Commit**

```bash
cd ..
git add backend/UserApp.Infrastructure/
git commit -m "feat: add EF Core DbContext, migrations, and data seeder"
```

---

### Task 5: PasswordService (TDD)

**Files:**
- Create: `UserApp.Infrastructure/Services/PasswordService.cs`
- Create: `UserApp.Tests/Services/PasswordServiceTests.cs`

- [ ] **Step 1: Write the failing tests**

`backend/UserApp.Tests/Services/PasswordServiceTests.cs`:
```csharp
using UserApp.Infrastructure.Services;
using Xunit;

namespace UserApp.Tests.Services;

public class PasswordServiceTests
{
    private readonly PasswordService _sut = new();

    [Fact]
    public void Hash_ReturnsNonEmptyString()
    {
        var hash = _sut.Hash("password123");
        Assert.False(string.IsNullOrEmpty(hash));
    }

    [Fact]
    public void Verify_CorrectPassword_ReturnsTrue()
    {
        var hash = _sut.Hash("password123");
        Assert.True(_sut.Verify("password123", hash));
    }

    [Fact]
    public void Verify_WrongPassword_ReturnsFalse()
    {
        var hash = _sut.Hash("password123");
        Assert.False(_sut.Verify("wrong", hash));
    }

    [Fact]
    public void Hash_SamePasswordTwice_ReturnsDifferentHashes()
    {
        var hash1 = _sut.Hash("password123");
        var hash2 = _sut.Hash("password123");
        Assert.NotEqual(hash1, hash2);
    }
}
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd backend && dotnet test UserApp.Tests/UserApp.Tests.csproj --filter "PasswordServiceTests"
```

Expected: compile error — `PasswordService` not found.

- [ ] **Step 3: Implement `PasswordService`**

`backend/UserApp.Infrastructure/Services/PasswordService.cs`:
```csharp
using UserApp.Application.Interfaces;

namespace UserApp.Infrastructure.Services;

public class PasswordService : IPasswordService
{
    public string Hash(string password) =>
        BCrypt.Net.BCrypt.HashPassword(password);

    public bool Verify(string password, string hash) =>
        BCrypt.Net.BCrypt.Verify(password, hash);
}
```

- [ ] **Step 4: Run tests — confirm they pass**

```bash
dotnet test UserApp.Tests/UserApp.Tests.csproj --filter "PasswordServiceTests"
```

Expected: `4 passed, 0 failed`.

- [ ] **Step 5: Commit**

```bash
cd ..
git add backend/UserApp.Infrastructure/Services/PasswordService.cs backend/UserApp.Tests/Services/PasswordServiceTests.cs
git commit -m "feat: add PasswordService with BCrypt (TDD)"
```

---

### Task 6: TokenService (TDD)

**Files:**
- Create: `UserApp.Infrastructure/Services/TokenService.cs`
- Create: `UserApp.Tests/Services/TokenServiceTests.cs`

- [ ] **Step 1: Write the failing tests**

`backend/UserApp.Tests/Services/TokenServiceTests.cs`:
```csharp
using System.IdentityModel.Tokens.Jwt;
using Microsoft.Extensions.Configuration;
using UserApp.Infrastructure.Services;
using Xunit;

namespace UserApp.Tests.Services;

public class TokenServiceTests
{
    private readonly TokenService _sut;

    public TokenServiceTests()
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Key"] = "super-secret-key-for-tests-that-is-at-least-32-chars",
                ["Jwt:Issuer"] = "TestIssuer",
                ["Jwt:Audience"] = "TestAudience",
                ["Jwt:ExpiryMinutes"] = "30"
            })
            .Build();
        _sut = new TokenService(config);
    }

    [Fact]
    public void GenerateAccessToken_ReturnsNonEmptyString()
    {
        var token = _sut.GenerateAccessToken(Guid.NewGuid(), "user");
        Assert.False(string.IsNullOrEmpty(token));
    }

    [Fact]
    public void GenerateAccessToken_ContainsUserIdAndRole()
    {
        var userId = Guid.NewGuid();
        var token = _sut.GenerateAccessToken(userId, "admin");
        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);
        Assert.Equal(userId.ToString(), jwt.Subject);
        Assert.Contains(jwt.Claims, c => c.Value == "admin");
    }

    [Fact]
    public void GenerateRefreshToken_ReturnsDifferentValuesEachCall()
    {
        var t1 = _sut.GenerateRefreshToken();
        var t2 = _sut.GenerateRefreshToken();
        Assert.NotEqual(t1, t2);
    }
}
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd backend && dotnet test UserApp.Tests/UserApp.Tests.csproj --filter "TokenServiceTests"
```

Expected: compile error — `TokenService` not found.

- [ ] **Step 3: Implement `TokenService`**

`backend/UserApp.Infrastructure/Services/TokenService.cs`:
```csharp
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using UserApp.Application.Interfaces;

namespace UserApp.Infrastructure.Services;

public class TokenService(IConfiguration config) : ITokenService
{
    public string GenerateAccessToken(Guid userId, string role)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new Claim(ClaimTypes.Role, role),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };
        var token = new JwtSecurityToken(
            issuer: config["Jwt:Issuer"],
            audience: config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(double.Parse(config["Jwt:ExpiryMinutes"]!)),
            signingCredentials: creds);
        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string GenerateRefreshToken() => Guid.NewGuid().ToString("N");
}
```

- [ ] **Step 4: Run tests — confirm they pass**

```bash
dotnet test UserApp.Tests/UserApp.Tests.csproj --filter "TokenServiceTests"
```

Expected: `3 passed, 0 failed`.

- [ ] **Step 5: Commit**

```bash
cd ..
git add backend/UserApp.Infrastructure/Services/TokenService.cs backend/UserApp.Tests/Services/TokenServiceTests.cs
git commit -m "feat: add TokenService with JWT (TDD)"
```

---

### Task 7: Repositories

**Files:**
- Create: `UserApp.Infrastructure/Repositories/UserRepository.cs`
- Create: `UserApp.Infrastructure/Repositories/RefreshTokenRepository.cs`

- [ ] **Step 1: Implement `UserRepository`**

`backend/UserApp.Infrastructure/Repositories/UserRepository.cs`:
```csharp
using Microsoft.EntityFrameworkCore;
using UserApp.Application.Entities;
using UserApp.Application.Interfaces;
using UserApp.Infrastructure.Data;

namespace UserApp.Infrastructure.Repositories;

public class UserRepository(AppDbContext db) : IUserRepository
{
    public Task<User?> GetByIdAsync(Guid id) =>
        db.Users.FirstOrDefaultAsync(u => u.Id == id);

    public Task<User?> GetByEmailAsync(string email) =>
        db.Users.FirstOrDefaultAsync(u => u.Email == email);

    public async Task<(IEnumerable<User> Items, int Total)> GetPagedAsync(string? search, int page, int size)
    {
        var query = db.Users.Where(u => u.IsActive);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(u => u.Name.Contains(search) || u.Email.Contains(search));

        var total = await query.CountAsync();
        var items = await query
            .OrderBy(u => u.Name)
            .Skip((page - 1) * size)
            .Take(size)
            .ToListAsync();

        return (items, total);
    }

    public async Task AddAsync(User user) => await db.Users.AddAsync(user);

    public Task UpdateAsync(User user) { db.Users.Update(user); return Task.CompletedTask; }

    public Task SaveChangesAsync() => db.SaveChangesAsync();
}
```

- [ ] **Step 2: Implement `RefreshTokenRepository`**

`backend/UserApp.Infrastructure/Repositories/RefreshTokenRepository.cs`:
```csharp
using Microsoft.EntityFrameworkCore;
using UserApp.Application.Entities;
using UserApp.Application.Interfaces;
using UserApp.Infrastructure.Data;

namespace UserApp.Infrastructure.Repositories;

public class RefreshTokenRepository(AppDbContext db) : IRefreshTokenRepository
{
    public Task<RefreshToken?> GetByTokenAsync(string token) =>
        db.RefreshTokens.FirstOrDefaultAsync(t => t.Token == token);

    public async Task AddAsync(RefreshToken token) => await db.RefreshTokens.AddAsync(token);

    public Task UpdateAsync(RefreshToken token) { db.RefreshTokens.Update(token); return Task.CompletedTask; }

    public Task SaveChangesAsync() => db.SaveChangesAsync();
}
```

- [ ] **Step 3: Verify build**

```bash
cd backend && dotnet build UserApp.sln
```

Expected: `Build succeeded.`

- [ ] **Step 4: Commit**

```bash
cd ..
git add backend/UserApp.Infrastructure/Repositories/
git commit -m "feat: add EF Core repository implementations"
```

---

## Phase 3: Application Services

### Task 8: AuthService (TDD)

**Files:**
- Create: `UserApp.Application/Services/AuthService.cs`
- Create: `UserApp.Tests/Services/AuthServiceTests.cs`

- [ ] **Step 1: Write the failing tests**

`backend/UserApp.Tests/Services/AuthServiceTests.cs`:
```csharp
using Moq;
using UserApp.Application.DTOs.Auth;
using UserApp.Application.Entities;
using UserApp.Application.Exceptions;
using UserApp.Application.Interfaces;
using UserApp.Application.Services;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace UserApp.Tests.Services;

public class AuthServiceTests
{
    private readonly Mock<IUserRepository> _userRepo = new();
    private readonly Mock<IRefreshTokenRepository> _tokenRepo = new();
    private readonly Mock<ITokenService> _tokenService = new();
    private readonly Mock<IPasswordService> _passwordService = new();
    private readonly IConfiguration _config;
    private readonly AuthService _sut;

    public AuthServiceTests()
    {
        _config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?> { ["Jwt:RefreshExpiryDays"] = "7" })
            .Build();

        _tokenService.Setup(t => t.GenerateAccessToken(It.IsAny<Guid>(), It.IsAny<string>())).Returns("access-token");
        _tokenService.Setup(t => t.GenerateRefreshToken()).Returns("refresh-token");
        _tokenRepo.Setup(r => r.AddAsync(It.IsAny<RefreshToken>())).Returns(Task.CompletedTask);
        _tokenRepo.Setup(r => r.SaveChangesAsync()).Returns(Task.CompletedTask);

        _sut = new AuthService(_userRepo.Object, _tokenRepo.Object, _tokenService.Object, _passwordService.Object, _config);
    }

    [Fact]
    public async Task RegisterAsync_DuplicateEmail_ThrowsConflictException()
    {
        _userRepo.Setup(r => r.GetByEmailAsync("test@test.com"))
                 .ReturnsAsync(new User { Email = "test@test.com" });

        await Assert.ThrowsAsync<ConflictException>(() =>
            _sut.RegisterAsync(new RegisterDto { Name = "Test", Email = "test@test.com", Password = "pass1234" }));
    }

    [Fact]
    public async Task RegisterAsync_NewUser_ReturnsAccessAndRefreshTokens()
    {
        _userRepo.Setup(r => r.GetByEmailAsync(It.IsAny<string>())).ReturnsAsync((User?)null);
        _passwordService.Setup(p => p.Hash("pass1234")).Returns("hashed");
        _userRepo.Setup(r => r.AddAsync(It.IsAny<User>())).Returns(Task.CompletedTask);
        _userRepo.Setup(r => r.SaveChangesAsync()).Returns(Task.CompletedTask);

        var result = await _sut.RegisterAsync(new RegisterDto { Name = "Test", Email = "test@test.com", Password = "pass1234" });

        Assert.Equal("access-token", result.AccessToken);
        Assert.Equal("refresh-token", result.RefreshToken);
    }

    [Fact]
    public async Task LoginAsync_UserNotFound_ThrowsUnauthorizedException()
    {
        _userRepo.Setup(r => r.GetByEmailAsync("bad@test.com")).ReturnsAsync((User?)null);

        await Assert.ThrowsAsync<UnauthorizedException>(() =>
            _sut.LoginAsync(new LoginDto { Email = "bad@test.com", Password = "pass" }));
    }

    [Fact]
    public async Task LoginAsync_WrongPassword_ThrowsUnauthorizedException()
    {
        var user = new User { Id = Guid.NewGuid(), Email = "test@test.com", Role = "user", IsActive = true, PasswordHash = "hashed" };
        _userRepo.Setup(r => r.GetByEmailAsync("test@test.com")).ReturnsAsync(user);
        _passwordService.Setup(p => p.Verify("wrong", "hashed")).Returns(false);

        await Assert.ThrowsAsync<UnauthorizedException>(() =>
            _sut.LoginAsync(new LoginDto { Email = "test@test.com", Password = "wrong" }));
    }

    [Fact]
    public async Task LoginAsync_ValidCredentials_ReturnsTokens()
    {
        var user = new User { Id = Guid.NewGuid(), Email = "test@test.com", Role = "user", IsActive = true, PasswordHash = "hashed" };
        _userRepo.Setup(r => r.GetByEmailAsync("test@test.com")).ReturnsAsync(user);
        _passwordService.Setup(p => p.Verify("pass1234", "hashed")).Returns(true);

        var result = await _sut.LoginAsync(new LoginDto { Email = "test@test.com", Password = "pass1234" });

        Assert.Equal("access-token", result.AccessToken);
    }

    [Fact]
    public async Task RefreshAsync_RevokedToken_ThrowsUnauthorizedException()
    {
        var token = new RefreshToken { Token = "old", RevokedAt = DateTime.UtcNow };
        _tokenRepo.Setup(r => r.GetByTokenAsync("old")).ReturnsAsync(token);

        await Assert.ThrowsAsync<UnauthorizedException>(() => _sut.RefreshAsync("old"));
    }
}
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd backend && dotnet test UserApp.Tests/UserApp.Tests.csproj --filter "AuthServiceTests"
```

Expected: compile error — `AuthService` not found.

- [ ] **Step 3: Implement `AuthService`**

`backend/UserApp.Application/Services/AuthService.cs`:
```csharp
using Microsoft.Extensions.Configuration;
using UserApp.Application.DTOs.Auth;
using UserApp.Application.Entities;
using UserApp.Application.Exceptions;
using UserApp.Application.Interfaces;

namespace UserApp.Application.Services;

public class AuthService(
    IUserRepository users,
    IRefreshTokenRepository tokens,
    ITokenService tokenService,
    IPasswordService passwordService,
    IConfiguration config) : IAuthService
{
    public async Task<LoginResponseDto> RegisterAsync(RegisterDto dto)
    {
        var existing = await users.GetByEmailAsync(dto.Email.ToLowerInvariant());
        if (existing != null)
            throw new ConflictException("Email already in use.");

        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            Email = dto.Email.ToLowerInvariant(),
            PasswordHash = passwordService.Hash(dto.Password),
            Role = "user",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await users.AddAsync(user);
        await users.SaveChangesAsync();
        return await IssueTokensAsync(user);
    }

    public async Task<LoginResponseDto> LoginAsync(LoginDto dto)
    {
        var user = await users.GetByEmailAsync(dto.Email.ToLowerInvariant());
        if (user == null || !user.IsActive || !passwordService.Verify(dto.Password, user.PasswordHash))
            throw new UnauthorizedException("Invalid credentials.");

        return await IssueTokensAsync(user);
    }

    public async Task<LoginResponseDto> RefreshAsync(string refreshToken)
    {
        var token = await tokens.GetByTokenAsync(refreshToken);
        if (token == null || token.RevokedAt != null || token.ExpiresAt < DateTime.UtcNow)
            throw new UnauthorizedException("Invalid or expired refresh token.");

        var user = await users.GetByIdAsync(token.UserId);
        if (user == null || !user.IsActive)
            throw new UnauthorizedException("User not found or inactive.");

        token.RevokedAt = DateTime.UtcNow;
        await tokens.UpdateAsync(token);
        await tokens.SaveChangesAsync();

        return await IssueTokensAsync(user);
    }

    public async Task LogoutAsync(string refreshToken)
    {
        var token = await tokens.GetByTokenAsync(refreshToken);
        if (token == null) return;
        token.RevokedAt = DateTime.UtcNow;
        await tokens.UpdateAsync(token);
        await tokens.SaveChangesAsync();
    }

    private async Task<LoginResponseDto> IssueTokensAsync(User user)
    {
        var accessToken = tokenService.GenerateAccessToken(user.Id, user.Role);
        var refreshTokenStr = tokenService.GenerateRefreshToken();
        var expiryDays = int.Parse(config["Jwt:RefreshExpiryDays"] ?? "7");

        await tokens.AddAsync(new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Token = refreshTokenStr,
            ExpiresAt = DateTime.UtcNow.AddDays(expiryDays),
            CreatedAt = DateTime.UtcNow
        });
        await tokens.SaveChangesAsync();

        return new LoginResponseDto(
            accessToken,
            refreshTokenStr,
            new UserResponseDto(user.Id, user.Name, user.Email, user.Role));
    }
}
```

- [ ] **Step 4: Run tests — confirm they pass**

```bash
dotnet test UserApp.Tests/UserApp.Tests.csproj --filter "AuthServiceTests"
```

Expected: `6 passed, 0 failed`.

- [ ] **Step 5: Commit**

```bash
cd ..
git add backend/UserApp.Application/Services/AuthService.cs backend/UserApp.Tests/Services/AuthServiceTests.cs
git commit -m "feat: add AuthService with JWT + refresh token logic (TDD)"
```

---

### Task 9: UserService (TDD)

**Files:**
- Create: `UserApp.Application/Services/UserService.cs`
- Create: `UserApp.Tests/Services/UserServiceTests.cs`

- [ ] **Step 1: Write the failing tests**

`backend/UserApp.Tests/Services/UserServiceTests.cs`:
```csharp
using Moq;
using UserApp.Application.DTOs.Users;
using UserApp.Application.Entities;
using UserApp.Application.Exceptions;
using UserApp.Application.Interfaces;
using UserApp.Application.Services;
using Xunit;

namespace UserApp.Tests.Services;

public class UserServiceTests
{
    private readonly Mock<IUserRepository> _userRepo = new();
    private readonly Mock<IPasswordService> _password = new();
    private readonly UserService _sut;

    public UserServiceTests()
    {
        _sut = new UserService(_userRepo.Object, _password.Object);
    }

    [Fact]
    public async Task GetByIdAsync_UserRole_OtherUserId_ThrowsForbiddenException()
    {
        var requesterId = Guid.NewGuid();
        var targetId = Guid.NewGuid();

        await Assert.ThrowsAsync<ForbiddenException>(() =>
            _sut.GetByIdAsync(targetId, requesterId, "user"));
    }

    [Fact]
    public async Task GetByIdAsync_UserNotFound_ThrowsNotFoundException()
    {
        var id = Guid.NewGuid();
        _userRepo.Setup(r => r.GetByIdAsync(id)).ReturnsAsync((User?)null);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            _sut.GetByIdAsync(id, id, "user"));
    }

    [Fact]
    public async Task GetByIdAsync_AdminRole_AnyId_ReturnsUser()
    {
        var user = new User { Id = Guid.NewGuid(), Name = "Test", Email = "t@t.com", Role = "user", IsActive = true, CreatedAt = DateTime.UtcNow };
        _userRepo.Setup(r => r.GetByIdAsync(user.Id)).ReturnsAsync(user);

        var result = await _sut.GetByIdAsync(user.Id, Guid.NewGuid(), "admin");

        Assert.Equal(user.Id, result.Id);
    }

    [Fact]
    public async Task CreateAsync_DuplicateEmail_ThrowsConflictException()
    {
        _userRepo.Setup(r => r.GetByEmailAsync("dup@test.com"))
                 .ReturnsAsync(new User { Email = "dup@test.com" });

        await Assert.ThrowsAsync<ConflictException>(() =>
            _sut.CreateAsync(new CreateUserDto { Name = "X", Email = "dup@test.com", Password = "pass1234", Role = "user" }));
    }

    [Fact]
    public async Task DeleteAsync_SetsIsActiveFalse()
    {
        var user = new User { Id = Guid.NewGuid(), IsActive = true };
        _userRepo.Setup(r => r.GetByIdAsync(user.Id)).ReturnsAsync(user);
        _userRepo.Setup(r => r.UpdateAsync(It.IsAny<User>())).Returns(Task.CompletedTask);
        _userRepo.Setup(r => r.SaveChangesAsync()).Returns(Task.CompletedTask);

        await _sut.DeleteAsync(user.Id);

        _userRepo.Verify(r => r.UpdateAsync(It.Is<User>(u => !u.IsActive)), Times.Once);
    }

    [Fact]
    public async Task UpdateAsync_UserRole_OtherUserId_ThrowsForbiddenException()
    {
        var user = new User { Id = Guid.NewGuid(), IsActive = true };
        _userRepo.Setup(r => r.GetByIdAsync(user.Id)).ReturnsAsync(user);

        await Assert.ThrowsAsync<ForbiddenException>(() =>
            _sut.UpdateAsync(user.Id, new UpdateUserDto { Name = "X" }, Guid.NewGuid(), "user"));
    }
}
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd backend && dotnet test UserApp.Tests/UserApp.Tests.csproj --filter "UserServiceTests"
```

Expected: compile error — `UserService` not found.

- [ ] **Step 3: Implement `UserService`**

`backend/UserApp.Application/Services/UserService.cs`:
```csharp
using UserApp.Application.DTOs.Common;
using UserApp.Application.DTOs.Users;
using UserApp.Application.Entities;
using UserApp.Application.Exceptions;
using UserApp.Application.Interfaces;

namespace UserApp.Application.Services;

public class UserService(IUserRepository users, IPasswordService password) : IUserService
{
    public async Task<PagedResult<UserDto>> GetAllAsync(string? search, int page, int size)
    {
        var (items, total) = await users.GetPagedAsync(search, page, size);
        var dtos = items.Select(ToDto);
        return new PagedResult<UserDto>(dtos, total, page, size);
    }

    public async Task<UserDto> GetByIdAsync(Guid id, Guid requesterId, string requesterRole)
    {
        if (requesterRole != "admin" && requesterId != id)
            throw new ForbiddenException("Access denied.");

        var user = await users.GetByIdAsync(id);
        if (user == null || !user.IsActive)
            throw new NotFoundException("User not found.");

        return ToDto(user);
    }

    public async Task<UserDto> CreateAsync(CreateUserDto dto)
    {
        var existing = await users.GetByEmailAsync(dto.Email.ToLowerInvariant());
        if (existing != null)
            throw new ConflictException("Email already in use.");

        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            Email = dto.Email.ToLowerInvariant(),
            PasswordHash = password.Hash(dto.Password),
            Role = dto.Role,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await users.AddAsync(user);
        await users.SaveChangesAsync();
        return ToDto(user);
    }

    public async Task<UserDto> UpdateAsync(Guid id, UpdateUserDto dto, Guid requesterId, string requesterRole)
    {
        var user = await users.GetByIdAsync(id);
        if (user == null || !user.IsActive)
            throw new NotFoundException("User not found.");

        if (requesterRole != "admin" && requesterId != id)
            throw new ForbiddenException("Access denied.");

        user.Name = dto.Name;

        if (requesterRole == "admin")
        {
            if (dto.Email != null) user.Email = dto.Email.ToLowerInvariant();
            if (dto.Role != null) user.Role = dto.Role;
            if (dto.Password != null) user.PasswordHash = password.Hash(dto.Password);
        }

        user.UpdatedAt = DateTime.UtcNow;
        await users.UpdateAsync(user);
        await users.SaveChangesAsync();
        return ToDto(user);
    }

    public async Task DeleteAsync(Guid id)
    {
        var user = await users.GetByIdAsync(id);
        if (user == null)
            throw new NotFoundException("User not found.");

        user.IsActive = false;
        user.UpdatedAt = DateTime.UtcNow;
        await users.UpdateAsync(user);
        await users.SaveChangesAsync();
    }

    private static UserDto ToDto(User u) =>
        new(u.Id, u.Name, u.Email, u.Role, u.IsActive, u.CreatedAt);
}
```

- [ ] **Step 4: Run all backend tests**

```bash
dotnet test UserApp.Tests/UserApp.Tests.csproj
```

Expected: all tests pass (≥13).

- [ ] **Step 5: Commit**

```bash
cd ..
git add backend/UserApp.Application/Services/UserService.cs backend/UserApp.Tests/Services/UserServiceTests.cs
git commit -m "feat: add UserService with role-based access control (TDD)"
```

---

## Phase 4: API Layer

### Task 10: Program.cs + GlobalExceptionFilter + appsettings

**Files:**
- Create: `UserApp.Api/Filters/GlobalExceptionFilter.cs`
- Modify: `UserApp.Api/Program.cs`
- Modify: `UserApp.Api/appsettings.json`

- [ ] **Step 1: Create `GlobalExceptionFilter`**

`backend/UserApp.Api/Filters/GlobalExceptionFilter.cs`:
```csharp
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using UserApp.Application.Exceptions;

namespace UserApp.Api.Filters;

public class GlobalExceptionFilter(ILogger<GlobalExceptionFilter> logger) : IExceptionFilter
{
    public void OnException(ExceptionContext context)
    {
        var (status, message) = context.Exception switch
        {
            ConflictException e     => (409, e.Message),
            UnauthorizedException e => (401, e.Message),
            ForbiddenException e    => (403, e.Message),
            NotFoundException e     => (404, e.Message),
            _                       => (500, "An unexpected error occurred.")
        };

        if (status == 500)
            logger.LogError(context.Exception, "Unhandled exception");

        context.Result = new ObjectResult(new { status, message }) { StatusCode = status };
        context.ExceptionHandled = true;
    }
}
```

- [ ] **Step 2: Write `appsettings.json` (non-secret values only)**

`backend/UserApp.Api/appsettings.json`:
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "Jwt": {
    "Issuer": "UserApp",
    "Audience": "UserApp",
    "ExpiryMinutes": "30",
    "RefreshExpiryDays": "7"
  },
  "Cors": {
    "AllowedOrigin": "http://localhost:5173"
  }
}
```

- [ ] **Step 3: Configure user-secrets (connection string + JWT key)**

```bash
cd backend/UserApp.Api
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=localhost,1433;Database=UserAppDb;User Id=sa;Password=YourStrong@Password123;TrustServerCertificate=True"
dotnet user-secrets set "Jwt:Key" "super-secret-jwt-key-that-is-at-least-32-characters-long"
cd ../..
```

- [ ] **Step 4: Write `Program.cs`**

`backend/UserApp.Api/Program.cs`:
```csharp
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;
using UserApp.Api.Filters;
using UserApp.Application.Interfaces;
using UserApp.Application.Services;
using UserApp.Infrastructure.Data;
using UserApp.Infrastructure.Repositories;
using UserApp.Infrastructure.Services;

Log.Logger = new LoggerConfiguration().WriteTo.Console().CreateBootstrapLogger();

try
{
    var builder = WebApplication.CreateBuilder(args);

    builder.Host.UseSerilog((ctx, lc) => lc
        .ReadFrom.Configuration(ctx.Configuration)
        .WriteTo.Console()
        .WriteTo.File("logs/app-.log", rollingInterval: RollingInterval.Day));

    builder.Services.AddDbContext<AppDbContext>(opt =>
        opt.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

    builder.Services.AddScoped<IUserRepository, UserRepository>();
    builder.Services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
    builder.Services.AddScoped<IPasswordService, PasswordService>();
    builder.Services.AddScoped<ITokenService, TokenService>();
    builder.Services.AddScoped<IAuthService, AuthService>();
    builder.Services.AddScoped<IUserService, UserService>();

    builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(opt =>
        {
            opt.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = builder.Configuration["Jwt:Issuer"],
                ValidAudience = builder.Configuration["Jwt:Audience"],
                IssuerSigningKey = new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
            };
        });

    builder.Services.AddAuthorization();

    builder.Services.AddCors(opt =>
        opt.AddPolicy("Frontend", p => p
            .WithOrigins(builder.Configuration["Cors:AllowedOrigin"]!)
            .AllowAnyHeader()
            .AllowAnyMethod()));

    builder.Services.AddControllers(opt => opt.Filters.Add<GlobalExceptionFilter>());

    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen(c =>
    {
        c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            Description = "Paste your access token here"
        });
        c.AddSecurityRequirement(new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = "Bearer"
                    }
                },
                Array.Empty<string>()
            }
        });
    });

    var app = builder.Build();

    using (var scope = app.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var pwd = scope.ServiceProvider.GetRequiredService<IPasswordService>();
        await db.Database.MigrateAsync();
        await DataSeeder.SeedAsync(db, pwd);
    }

    app.UseSerilogRequestLogging();
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseCors("Frontend");
    app.UseAuthentication();
    app.UseAuthorization();
    app.MapControllers();

    await app.RunAsync();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
```

- [ ] **Step 5: Create EF Core migration (if not done in Task 4)**

```bash
cd backend
dotnet ef migrations add InitialCreate \
  --project UserApp.Infrastructure/UserApp.Infrastructure.csproj \
  --startup-project UserApp.Api/UserApp.Api.csproj
cd ..
```

Expected: `Migrations/` folder appears in `UserApp.Infrastructure`.

- [ ] **Step 6: Verify build**

```bash
cd backend && dotnet build UserApp.sln
```

Expected: `Build succeeded.`

- [ ] **Step 7: Commit**

```bash
cd ..
git add backend/UserApp.Api/ backend/UserApp.Infrastructure/Data/Migrations/
git commit -m "feat: wire Program.cs with JWT auth, CORS, Swagger, Serilog, and DI"
```

---

### Task 11: AuthController

**Files:**
- Create: `UserApp.Api/Controllers/AuthController.cs`

- [ ] **Step 1: Create `AuthController`**

`backend/UserApp.Api/Controllers/AuthController.cs`:
```csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UserApp.Application.DTOs.Auth;
using UserApp.Application.Interfaces;

namespace UserApp.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IAuthService authService) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        var result = await authService.RegisterAsync(dto);
        return Created(string.Empty, result);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var result = await authService.LoginAsync(dto);
        return Ok(result);
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] RefreshDto dto)
    {
        var result = await authService.RefreshAsync(dto.RefreshToken);
        return Ok(result);
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout([FromBody] RefreshDto dto)
    {
        await authService.LogoutAsync(dto.RefreshToken);
        return NoContent();
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add backend/UserApp.Api/Controllers/AuthController.cs
git commit -m "feat: add AuthController (register, login, refresh, logout)"
```

---

### Task 12: UsersController

**Files:**
- Create: `UserApp.Api/Controllers/UsersController.cs`

- [ ] **Step 1: Create `UsersController`**

`backend/UserApp.Api/Controllers/UsersController.cs`:
```csharp
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UserApp.Application.DTOs.Users;
using UserApp.Application.Interfaces;

namespace UserApp.Api.Controllers;

[ApiController]
[Route("api/users")]
[Authorize]
public class UsersController(IUserService userService) : ControllerBase
{
    private Guid RequesterId =>
        Guid.Parse(User.FindFirstValue(JwtRegisteredClaimNames.Sub)!);

    private string RequesterRole =>
        User.FindFirstValue(ClaimTypes.Role)!;

    [HttpGet]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int size = 10)
    {
        var result = await userService.GetAllAsync(search, page, size);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await userService.GetByIdAsync(id, RequesterId, RequesterRole);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Create([FromBody] CreateUserDto dto)
    {
        var result = await userService.CreateAsync(dto);
        return Created($"/api/users/{result.Id}", result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateUserDto dto)
    {
        var result = await userService.UpdateAsync(id, dto, RequesterId, RequesterRole);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await userService.DeleteAsync(id);
        return NoContent();
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add backend/UserApp.Api/Controllers/UsersController.cs
git commit -m "feat: add UsersController with role-based authorization"
```

---

### Task 13: Backend smoke test via Swagger

- [ ] **Step 1: Start the API**

```bash
cd backend && dotnet run --project UserApp.Api/UserApp.Api.csproj
```

Expected: API starts, migrations applied, seed data inserted. Output shows `Now listening on: https://localhost:5001`.

- [ ] **Step 2: Open Swagger and verify endpoints**

Open `https://localhost:5001/swagger` in a browser.

Expected: Swagger UI shows `auth` and `users` groups with all endpoints listed.

- [ ] **Step 3: Test login with seeded admin**

In Swagger, call `POST /api/auth/login` with:
```json
{ "email": "admin@demo.com", "password": "Admin123!" }
```

Expected: `200 OK` response with `accessToken`, `refreshToken`, and `user` object.

- [ ] **Step 4: Test CRUD as admin**

Copy the `accessToken`, click "Authorize" in Swagger, paste it. Then:
- `GET /api/users?page=1&size=10` → returns both seeded users
- `POST /api/users` with a new email → returns new user
- `DELETE /api/users/{newUserId}` → returns `204 No Content`

- [ ] **Step 5: Test 403 for user role**

Login as `user@demo.com / User123!`, authorize with that token.
Call `GET /api/users` → Expected: `403 Forbidden`.

- [ ] **Step 6: Commit**

```bash
cd ..
git add .
git commit -m "feat: backend complete — auth + CRUD + roles working"
```

---

## Phase 5: Frontend

### Task 14: Vite project + Axios instance + AuthContext

**Files:**
- Create: all `frontend/` files in this task

- [ ] **Step 1: Scaffold the Vite project**

```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
npm install react-router-dom axios react-hook-form
npm install -D vitest @vitest/coverage-v8 @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
cd ..
```

- [ ] **Step 2: Configure Vitest in `vite.config.ts`**

`frontend/vite.config.ts`:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
});
```

- [ ] **Step 3: Create `src/setupTests.ts`**

`frontend/src/setupTests.ts`:
```typescript
import '@testing-library/jest-dom';
```

- [ ] **Step 4: Create `.env.example`**

`frontend/.env.example`:
```
VITE_API_BASE_URL=https://localhost:5001
```

- [ ] **Step 5: Create `src/api/axiosInstance.ts`**

`frontend/src/api/axiosInstance.ts`:
```typescript
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://localhost:5001';

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: string) => void; reject: (e: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status !== 401 || original._retry) return Promise.reject(error);

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      });
    }

    original._retry = true;
    isRefreshing = true;
    const refreshToken = localStorage.getItem('refreshToken');

    try {
      const { data } = await axios.post(`${BASE_URL}/api/auth/refresh`, { refreshToken });
      sessionStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      processQueue(null, data.accessToken);
      original.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(original);
    } catch (err) {
      processQueue(err, null);
      sessionStorage.clear();
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
```

- [ ] **Step 6: Create `src/context/AuthContext.tsx`**

`frontend/src/context/AuthContext.tsx`:
```tsx
import { createContext, useContext, useState, ReactNode } from 'react';
import api from '../api/axiosInstance';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
}

interface AuthContextValue extends AuthState {
  login: (accessToken: string, refreshToken: string, user: AuthUser) => void;
  logout: () => Promise<void>;
  updateUser: (updated: Partial<AuthUser>) => void;
  isAdmin: () => boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => ({
    accessToken: sessionStorage.getItem('accessToken'),
    user: (() => {
      const u = sessionStorage.getItem('user');
      return u ? (JSON.parse(u) as AuthUser) : null;
    })(),
  }));

  const login = (accessToken: string, refreshToken: string, user: AuthUser) => {
    sessionStorage.setItem('accessToken', accessToken);
    sessionStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('refreshToken', refreshToken);
    setState({ accessToken, user });
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await api.post('/api/auth/logout', { refreshToken });
      } catch {}
    }
    sessionStorage.clear();
    localStorage.removeItem('refreshToken');
    setState({ accessToken: null, user: null });
  };

  const updateUser = (updated: Partial<AuthUser>) => {
    if (!state.user) return;
    const newUser = { ...state.user, ...updated };
    sessionStorage.setItem('user', JSON.stringify(newUser));
    setState((prev) => ({ ...prev, user: newUser }));
  };

  const isAdmin = () => state.user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ ...state, login, logout, updateUser, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
```

- [ ] **Step 7: Verify frontend project starts**

```bash
cd frontend && npm run dev
```

Expected: Vite dev server starts on `http://localhost:5173`.

- [ ] **Step 8: Commit**

```bash
cd ..
git add frontend/
git commit -m "feat: scaffold React frontend with Axios interceptor and AuthContext"
```

---

### Task 15: Route guards, Layout, and App router

**Files:**
- Create: `frontend/src/components/PrivateRoute.tsx`
- Create: `frontend/src/components/AdminRoute.tsx`
- Create: `frontend/src/components/Layout.tsx`
- Create: `frontend/src/App.tsx`
- Modify: `frontend/src/main.tsx`

- [ ] **Step 1: Create `PrivateRoute` and `AdminRoute`**

`frontend/src/components/PrivateRoute.tsx`:
```tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function PrivateRoute() {
  const { accessToken } = useAuth();
  return accessToken ? <Outlet /> : <Navigate to="/login" replace />;
}
```

`frontend/src/components/AdminRoute.tsx`:
```tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function AdminRoute() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/profile" replace />;
  return <Outlet />;
}
```

- [ ] **Step 2: Create `Layout`**

`frontend/src/components/Layout.tsx`:
```tsx
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div>
      <nav style={{
        background: '#2563eb',
        padding: '0 2rem',
        display: 'flex',
        alignItems: 'center',
        height: '56px',
        boxShadow: '0 2px 8px rgba(37,99,235,0.3)'
      }}>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: '18px', marginRight: 'auto' }}>
          UserApp
        </span>
        {isAdmin() && (
          <Link to="/users" style={{ color: '#fff', textDecoration: 'none', marginRight: '1.5rem', fontSize: '14px' }}>
            Users
          </Link>
        )}
        <Link to="/profile" style={{ color: '#fff', textDecoration: 'none', marginRight: '1.5rem', fontSize: '14px' }}>
          {user?.name}
        </Link>
        <button
          onClick={handleLogout}
          style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}
        >
          Logout
        </button>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
```

- [ ] **Step 3: Create `App.tsx`**

`frontend/src/App.tsx`:
```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import { AdminRoute } from './components/AdminRoute';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { UsersPage } from './pages/UsersPage';
import { UserFormPage } from './pages/UserFormPage';
import { ProfilePage } from './pages/ProfilePage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>
              <Route element={<AdminRoute />}>
                <Route path="/users" element={<UsersPage />} />
                <Route path="/users/new" element={<UserFormPage />} />
                <Route path="/users/:id/edit" element={<UserFormPage />} />
              </Route>
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
```

- [ ] **Step 4: Update `main.tsx`**

`frontend/src/main.tsx`:
```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/
git commit -m "feat: add route guards, Layout navbar, and App router"
```

---

### Task 16: LoginPage + RegisterPage (TDD)

**Files:**
- Create: `frontend/src/pages/LoginPage.tsx`
- Create: `frontend/src/pages/RegisterPage.tsx`
- Create: `frontend/src/__tests__/LoginPage.test.tsx`

- [ ] **Step 1: Write the failing tests**

`frontend/src/__tests__/LoginPage.test.tsx`:
```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { LoginPage } from '../pages/LoginPage';
import { AuthContext } from '../context/AuthContext';
import type { AuthUser } from '../context/AuthContext';
import api from '../api/axiosInstance';

vi.mock('../api/axiosInstance', () => ({
  default: { post: vi.fn() },
}));

const mockLogin = vi.fn();
const mockCtx = {
  user: null,
  accessToken: null,
  login: mockLogin,
  logout: vi.fn(),
  updateUser: vi.fn(),
  isAdmin: () => false,
};

function setup() {
  return render(
    <AuthContext.Provider value={mockCtx}>
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe('LoginPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders email and password fields', () => {
    setup();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('shows validation errors when submitted empty', async () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('calls login on successful response', async () => {
    const mockUser: AuthUser = { id: '1', name: 'Admin', email: 'admin@demo.com', role: 'admin' };
    vi.mocked(api.post).mockResolvedValueOnce({
      data: { accessToken: 'tok', refreshToken: 'ref', user: mockUser },
    });
    setup();
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'admin@demo.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'Admin123!' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith('tok', 'ref', mockUser));
  });

  it('shows server error on failed login', async () => {
    vi.mocked(api.post).mockRejectedValueOnce({
      response: { data: { message: 'Invalid credentials.' } },
    });
    setup();
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'bad@demo.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(/invalid credentials/i)
    );
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd frontend && npx vitest run src/__tests__/LoginPage.test.tsx
```

Expected: fail — `LoginPage` not found.

- [ ] **Step 3: Implement `LoginPage`**

`frontend/src/pages/LoginPage.tsx`:
```tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

interface LoginForm {
  email: string;
  password: string;
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 12px', border: '1px solid #d1d5db',
  borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box',
};

export function LoginPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const onSubmit = async (data: LoginForm) => {
    setServerError('');
    try {
      const res = await api.post('/api/auth/login', data);
      login(res.data.accessToken, res.data.refreshToken, res.data.user);
      navigate(res.data.user.role === 'admin' ? '/users' : '/profile');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setServerError(e.response?.data?.message ?? 'Login failed. Please try again.');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f3f4f6' }}>
      <div style={{ background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 6px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
        <h1 style={{ color: '#1e3a8a', marginBottom: '0.25rem' }}>Sign in</h1>
        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Enter your credentials to continue</p>

        {serverError && (
          <div role="alert" style={{ background: '#fef2f2', color: '#991b1b', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '14px' }}>
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>Email</label>
            <input
              id="email" type="email"
              {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })}
              style={inputStyle} aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-err' : undefined}
            />
            {errors.email && <span id="email-err" style={{ color: '#dc2626', fontSize: '12px' }}>{errors.email.message}</span>}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>Password</label>
            <input
              id="password" type="password"
              {...register('password', { required: 'Password is required' })}
              style={inputStyle} aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'pass-err' : undefined}
            />
            {errors.password && <span id="pass-err" style={{ color: '#dc2626', fontSize: '12px' }}>{errors.password.message}</span>}
          </div>

          <button
            type="submit" disabled={isSubmitting}
            style={{ width: '100%', padding: '10px', background: isSubmitting ? '#93c5fd' : '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '15px', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '14px', color: '#6b7280' }}>
          Don't have an account? <Link to="/register" style={{ color: '#2563eb' }}>Register</Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run tests — confirm they pass**

```bash
npx vitest run src/__tests__/LoginPage.test.tsx
```

Expected: `4 passed, 0 failed`.

- [ ] **Step 5: Implement `RegisterPage`**

`frontend/src/pages/RegisterPage.tsx`:
```tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

interface RegisterForm { name: string; email: string; password: string; }

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 12px', border: '1px solid #d1d5db',
  borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box',
};

export function RegisterPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const onSubmit = async (data: RegisterForm) => {
    setServerError('');
    try {
      const res = await api.post('/api/auth/register', data);
      login(res.data.accessToken, res.data.refreshToken, res.data.user);
      navigate('/profile');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setServerError(e.response?.data?.message ?? 'Registration failed. Please try again.');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f3f4f6' }}>
      <div style={{ background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 6px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
        <h1 style={{ color: '#1e3a8a', marginBottom: '0.25rem' }}>Create account</h1>
        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Fill in your details to register</p>

        {serverError && (
          <div role="alert" style={{ background: '#fef2f2', color: '#991b1b', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '14px' }}>
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {[
            { id: 'name', label: 'Full name', type: 'text', rules: { required: 'Name is required' } },
            { id: 'email', label: 'Email', type: 'email', rules: { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } } },
            { id: 'password', label: 'Password', type: 'password', rules: { required: 'Password is required', minLength: { value: 8, message: 'At least 8 characters' } } },
          ].map(({ id, label, type, rules }) => (
            <div key={id} style={{ marginBottom: '1rem' }}>
              <label htmlFor={id} style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>{label}</label>
              <input id={id} type={type} {...register(id as keyof RegisterForm, rules)} style={inputStyle} />
              {errors[id as keyof RegisterForm] && (
                <span style={{ color: '#dc2626', fontSize: '12px' }}>{errors[id as keyof RegisterForm]?.message}</span>
              )}
            </div>
          ))}

          <button
            type="submit" disabled={isSubmitting}
            style={{ width: '100%', padding: '10px', background: isSubmitting ? '#93c5fd' : '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '15px', cursor: isSubmitting ? 'not-allowed' : 'pointer', marginTop: '0.5rem' }}
          >
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '14px', color: '#6b7280' }}>
          Already have an account? <Link to="/login" style={{ color: '#2563eb' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
cd ..
git add frontend/src/pages/LoginPage.tsx frontend/src/pages/RegisterPage.tsx frontend/src/__tests__/LoginPage.test.tsx
git commit -m "feat: add LoginPage and RegisterPage with validation (TDD)"
```

---

### Task 17: UsersPage (table + search + pagination)

**Files:**
- Create: `frontend/src/pages/UsersPage.tsx`

- [ ] **Step 1: Implement `UsersPage`**

`frontend/src/pages/UsersPage.tsx`:
```tsx
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosInstance';

interface User { id: string; name: string; email: string; role: string; isActive: boolean; }
interface PagedResult { items: User[]; totalCount: number; page: number; size: number; }

const PAGE_SIZE = 10;

export function UsersPage() {
  const [data, setData] = useState<PagedResult | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await api.get('/api/users', { params: { search, page, size: PAGE_SIZE } });
      setData(res.data);
    } catch {
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this user?')) return;
    try { await api.delete(`/api/users/${id}`); fetchUsers(); }
    catch { setError('Failed to delete user.'); }
  };

  const totalPages = data ? Math.ceil(data.totalCount / PAGE_SIZE) : 0;

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ color: '#1e3a8a', margin: 0 }}>Users</h1>
        <Link to="/users/new" style={{ background: '#2563eb', color: '#fff', padding: '8px 16px', borderRadius: '4px', textDecoration: 'none', fontSize: '14px' }}>+ New user</Link>
      </div>

      <input
        type="text" placeholder="Search by name or email..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px', marginBottom: '1rem', boxSizing: 'border-box' }}
      />

      {error && <div role="alert" style={{ color: '#991b1b', marginBottom: '1rem', fontSize: '14px' }}>{error}</div>}

      {loading ? <p style={{ color: '#6b7280' }}>Loading...</p> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#eff6ff', color: '#1e3a8a' }}>
                {['Name', 'Email', 'Role', 'Active', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data?.items.length === 0 && (
                <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>No users found.</td></tr>
              )}
              {data?.items.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 12px' }}>{u.name}</td>
                  <td style={{ padding: '10px 12px', color: '#6b7280' }}>{u.email}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ background: u.role === 'admin' ? '#eff6ff' : '#f9fafb', color: u.role === 'admin' ? '#1e3a8a' : '#6b7280', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 500 }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', color: u.isActive ? '#16a34a' : '#dc2626' }}>{u.isActive ? 'Yes' : 'No'}</td>
                  <td style={{ padding: '10px 12px', display: 'flex', gap: '12px' }}>
                    <Link to={`/users/${u.id}/edit`} style={{ color: '#2563eb', textDecoration: 'none', fontSize: '13px' }}>Edit</Link>
                    <button onClick={() => handleDelete(u.id)} style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '13px' }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '1rem' }}>
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '4px 10px', border: '1px solid #d1d5db', borderRadius: '4px', cursor: page === 1 ? 'not-allowed' : 'pointer', background: '#fff' }}>←</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)} style={{ padding: '4px 10px', border: '1px solid #d1d5db', borderRadius: '4px', background: p === page ? '#2563eb' : '#fff', color: p === page ? '#fff' : '#374151', cursor: 'pointer' }}>{p}</button>
          ))}
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: '4px 10px', border: '1px solid #d1d5db', borderRadius: '4px', cursor: page === totalPages ? 'not-allowed' : 'pointer', background: '#fff' }}>→</button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/UsersPage.tsx
git commit -m "feat: add UsersPage with server-side search and pagination"
```

---

### Task 18: UserFormPage + ProfilePage

**Files:**
- Create: `frontend/src/pages/UserFormPage.tsx`
- Create: `frontend/src/pages/ProfilePage.tsx`

- [ ] **Step 1: Implement `UserFormPage`**

`frontend/src/pages/UserFormPage.tsx`:
```tsx
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axiosInstance';

interface UserForm { name: string; email: string; password: string; role: string; }

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 12px', border: '1px solid #d1d5db',
  borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box',
};

export function UserFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<UserForm>({ defaultValues: { role: 'user' } });

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/api/users/${id}`).then((res) =>
      reset({ name: res.data.name, email: res.data.email, role: res.data.role, password: '' })
    );
  }, [id, isEdit, reset]);

  const onSubmit = async (data: UserForm) => {
    setServerError('');
    const payload = { ...data, password: data.password || undefined };
    try {
      if (isEdit) await api.put(`/api/users/${id}`, payload);
      else await api.post('/api/users', payload);
      navigate('/users');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setServerError(e.response?.data?.message ?? 'Operation failed. Please try again.');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '500px' }}>
      <h1 style={{ color: '#1e3a8a', marginBottom: '1.5rem' }}>{isEdit ? 'Edit user' : 'New user'}</h1>

      {serverError && (
        <div role="alert" style={{ background: '#fef2f2', color: '#991b1b', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '14px' }}>
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="name" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>Full name</label>
          <input id="name" {...register('name', { required: 'Name is required' })} style={inputStyle} />
          {errors.name && <span style={{ color: '#dc2626', fontSize: '12px' }}>{errors.name.message}</span>}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>Email</label>
          <input id="email" type="email" {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })} style={inputStyle} />
          {errors.email && <span style={{ color: '#dc2626', fontSize: '12px' }}>{errors.email.message}</span>}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>
            Password {isEdit && <span style={{ color: '#6b7280', fontWeight: 400 }}>(leave blank to keep current)</span>}
          </label>
          <input
            id="password" type="password"
            {...register('password', { ...(!isEdit && { required: 'Password is required' }), minLength: { value: 8, message: 'At least 8 characters' } })}
            style={inputStyle}
          />
          {errors.password && <span style={{ color: '#dc2626', fontSize: '12px' }}>{errors.password.message}</span>}
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="role" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>Role</label>
          <select id="role" {...register('role', { required: true })} style={inputStyle}>
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="submit" disabled={isSubmitting} style={{ flex: 1, padding: '10px', background: isSubmitting ? '#93c5fd' : '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '15px', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
          <button type="button" onClick={() => navigate('/users')} style={{ flex: 1, padding: '10px', background: '#fff', color: '#374151', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '15px', cursor: 'pointer' }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Implement `ProfilePage`**

`frontend/src/pages/ProfilePage.tsx`:
```tsx
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';

interface ProfileForm { name: string; }

export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ProfileForm>();

  useEffect(() => {
    if (user) reset({ name: user.name });
  }, [user, reset]);

  const onSubmit = async (data: ProfileForm) => {
    setServerError(''); setSuccess(false);
    try {
      const res = await api.put(`/api/users/${user?.id}`, { name: data.name });
      updateUser({ name: res.data.name });
      setSuccess(true);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setServerError(e.response?.data?.message ?? 'Update failed.');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '500px' }}>
      <h1 style={{ color: '#1e3a8a', marginBottom: '0.25rem' }}>Profile</h1>
      <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>{user?.email}</p>

      {success && <div role="status" style={{ background: '#f0fdf4', color: '#166534', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '14px' }}>Profile updated.</div>}
      {serverError && <div role="alert" style={{ background: '#fef2f2', color: '#991b1b', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '14px' }}>{serverError}</div>}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="name" style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 500 }}>Full name</label>
          <input
            id="name" type="text"
            {...register('name', { required: 'Name is required' })}
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }}
          />
          {errors.name && <span style={{ color: '#dc2626', fontSize: '12px' }}>{errors.name.message}</span>}
        </div>
        <button type="submit" disabled={isSubmitting} style={{ padding: '10px 24px', background: isSubmitting ? '#93c5fd' : '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '15px', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}>
          {isSubmitting ? 'Saving...' : 'Update'}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 3: Run all frontend tests**

```bash
cd frontend && npx vitest run
```

Expected: all 4 LoginPage tests pass.

- [ ] **Step 4: Commit**

```bash
cd ..
git add frontend/src/pages/UserFormPage.tsx frontend/src/pages/ProfilePage.tsx
git commit -m "feat: add UserFormPage (create/edit) and ProfilePage"
```

---

## Phase 6: End-to-End Verification & Documentation

### Task 19: Full E2E test + README

**Files:**
- Create: `README.md`

- [ ] **Step 1: Start the full stack and run through all test scenarios**

In terminal 1:
```bash
docker compose up -d
cd backend && dotnet run --project UserApp.Api/UserApp.Api.csproj
```

In terminal 2:
```bash
cd frontend && npm run dev
```

Open `http://localhost:5173`.

- [ ] **Step 2: Scenario — Register → Login → Role redirect**

1. Go to `/register`, create `newuser@test.com / Password1!`
2. Should redirect to `/profile` (user role)
3. Navigate to `/users` manually → should redirect back to `/profile`

- [ ] **Step 3: Scenario — Admin CRUD**

1. Go to `/login`, sign in as `admin@demo.com / Admin123!`
2. Navigate to `/users` → see both seeded users + the newly registered one
3. Create a new user via `+ New user` button → appears in table
4. Edit a user's name → change reflects in table
5. Delete a user → row disappears

- [ ] **Step 4: Scenario — 403 Authorization**

In Swagger (`https://localhost:5001/swagger`):
1. Login as `user@demo.com` → get access token
2. Authorize with user token
3. Call `DELETE /api/users/{any-other-id}` → expect `403`

- [ ] **Step 5: Scenario — Token expiry**

In `appsettings.json` temporarily change `"ExpiryMinutes": "1"` and restart API. Log in, wait 90 seconds, make any API call → the silent refresh should fire automatically and the call should succeed. Change back to `"30"`.

- [ ] **Step 6: Write `README.md`**

`README.md`:
```markdown
# UserApp — Auth + User CRUD

Full-stack app: React 18 + Vite frontend, .NET 8 Clean Architecture backend, SQL Server in Docker.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 20+](https://nodejs.org/)
- [dotnet-ef tool](https://www.nuget.org/packages/dotnet-ef): `dotnet tool install --global dotnet-ef`

## Quick Start

### 1. Start SQL Server

```bash
docker compose up -d
```

### 2. Configure backend secrets

```bash
cd backend/UserApp.Api
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=localhost,1433;Database=UserAppDb;User Id=sa;Password=YourStrong@Password123;TrustServerCertificate=True"
dotnet user-secrets set "Jwt:Key" "super-secret-jwt-key-that-is-at-least-32-characters-long"
cd ../..
```

### 3. Run the backend

```bash
cd backend
dotnet run --project UserApp.Api/UserApp.Api.csproj
```

API starts on `https://localhost:5001`. Migrations apply automatically. Seed data is inserted on first run.

### 4. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend starts on `http://localhost:5173`.

## Swagger

Open `https://localhost:5001/swagger` to explore and test the API.
Click **Authorize** and paste your access token from a login response.

## Demo Credentials

| Email | Password | Role |
|---|---|---|
| admin@demo.com | Admin123! | admin |
| user@demo.com | User123! | user |

## Run Tests

```bash
# Backend
cd backend && dotnet test

# Frontend
cd frontend && npx vitest run
```

## Environment Variables (frontend)

Copy `.env.example` to `.env` and update `VITE_API_BASE_URL` if your backend runs on a different port.

## Architecture

- `backend/UserApp.Api` — Controllers, JWT middleware, Swagger, CORS, Serilog
- `backend/UserApp.Application` — Services, DTOs, interfaces, entities, exceptions
- `backend/UserApp.Infrastructure` — EF Core, repositories, BCrypt, JWT token service
- `frontend/src/` — React SPA with AuthContext, Axios interceptor, role-based routing
```

- [ ] **Step 7: Run all tests one final time**

```bash
cd backend && dotnet test UserApp.sln
cd ../frontend && npx vitest run
```

Expected: all backend tests pass, all frontend tests pass.

- [ ] **Step 8: Final commit**

```bash
cd ..
git add README.md
git commit -m "docs: add README with setup instructions and test credentials"
```

---

## Verification Checklist

- [ ] `docker compose up -d` starts SQL Server
- [ ] `dotnet run` applies migrations, seeds DB, starts API on `https://localhost:5001`
- [ ] Swagger shows all endpoints with bearer auth support
- [ ] `POST /api/auth/login` with `admin@demo.com / Admin123!` returns tokens
- [ ] `GET /api/users` as admin returns paginated results; search by name/email filters correctly
- [ ] `GET /api/users` as user role returns `403`
- [ ] `DELETE /api/users/{other-id}` as user role returns `403`
- [ ] Frontend redirects unauthenticated users to `/login`
- [ ] Admin sees "Users" link in navbar; user does not
- [ ] Admin can create, edit, delete users
- [ ] User can only edit their own name at `/profile`
- [ ] Token refresh fires silently on 401
- [ ] Logout revokes refresh token in DB
- [ ] All 4 backend test projects pass
- [ ] All frontend Vitest tests pass
- [ ] `git log --oneline` contains no "Claude", "Anthropic", or "Co-Authored-By: Claude" in any commit message
- [ ] No file in the repo contains references to Claude, Anthropic, or AI generation tools

---

## Optional Phase: AWS Deployment

See `docs/superpowers/specs/2026-05-19-auth-user-crud-design.md` → "Optional: AWS Deployment" section for the step-by-step EC2 + Amplify deployment guide. Tackle this only after the local app is complete and all verification steps above pass.
