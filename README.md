# UserApp — Autenticación + CRUD de Usuarios

Aplicación full-stack con frontend en React 18 + Vite y backend en .NET 8 Clean Architecture, usando SQL Server en Docker.

## Requisitos previos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/)
- Herramienta dotnet-ef: `dotnet tool install --global dotnet-ef`

## Inicio rápido

### 1. Iniciar SQL Server

```bash
docker compose up -d
```

### 2. Configurar secretos del backend

```bash
cd backend/UserApp.Api
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=localhost,1433;Database=UserAppDb;User Id=sa;Password=YourStrong@Password123;TrustServerCertificate=True"
dotnet user-secrets set "Jwt:Key" "super-secret-jwt-key-that-is-at-least-32-characters-long"
cd ../..
```

### 3. Ejecutar el backend

```bash
cd backend
dotnet run --project UserApp.Api/UserApp.Api.csproj
```

La API inicia en `https://localhost:5001`. Las migraciones se aplican automáticamente y los datos de prueba se insertan en el primer arranque.

### 4. Ejecutar el frontend

```bash
cd frontend
npm install
npm run dev
```

El frontend inicia en `http://localhost:5173`.

## Swagger

Abre `https://localhost:5001/swagger` para explorar y probar la API.
Haz clic en **Authorize** y pega el access token obtenido al iniciar sesión.

## Credenciales de prueba

| Email | Contraseña | Rol |
|---|---|---|
| admin@demo.com | Admin123! | admin |
| user@demo.com | User123! | user |

## Ejecutar pruebas

```bash
# Backend
cd backend && dotnet test

# Frontend
cd frontend && npx vitest run
```

## Variables de entorno (frontend)

Copia `frontend/.env.example` a `frontend/.env` y actualiza `VITE_API_BASE_URL` si el backend corre en un puerto diferente.

## Arquitectura

```
backend/
  UserApp.Api/            Controladores, middleware JWT, Swagger, CORS, Serilog
  UserApp.Application/    Servicios, DTOs, interfaces, entidades, excepciones
  UserApp.Infrastructure/ EF Core, repositorios, BCrypt, servicio JWT, migraciones
frontend/src/
  api/                    Instancia de Axios con interceptor de refresco de token
  context/                AuthContext (estado del usuario, login/logout)
  components/             Guards de rutas, navbar de Layout
  pages/                  Login, Register, Users, UserForm, UserDetail, Profile
```

## Rutas del frontend

| Ruta | Acceso | Descripción |
|---|---|---|
| `/login` | Público | Inicio de sesión |
| `/register` | Público | Registro de cuenta |
| `/users` | Admin | Tabla de usuarios con búsqueda y paginación |
| `/users/new` | Admin | Crear nuevo usuario |
| `/users/:id` | Admin | Ver detalle de usuario |
| `/users/:id/edit` | Admin | Editar usuario |
| `/profile` | Autenticado | Ver y editar perfil propio |

## Endpoints API

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/api/auth/register` | Público | Registrar usuario |
| POST | `/api/auth/login` | Público | Iniciar sesión → `{ accessToken, refreshToken, user }` |
| POST | `/api/auth/refresh` | Público | Renovar access token |
| POST | `/api/auth/logout` | Autenticado | Revocar refresh token |
| GET | `/api/users?search=&role=&isActive=&page=&size=` | Admin | Listar usuarios paginados |
| GET | `/api/users/:id` | Admin o dueño | Ver usuario |
| POST | `/api/users` | Admin | Crear usuario |
| PUT | `/api/users/:id` | Admin o dueño | Actualizar usuario |
| DELETE | `/api/users/:id` | Admin | Eliminar usuario (lógico) |

## Seguridad

- Contraseñas hasheadas con BCrypt (salt embebido en el hash)
- Tokens de acceso JWT (HS256, expiración de 30 minutos)
- Refresh tokens almacenados en base de datos, rotados en cada uso y revocados al cerrar sesión
- Acceso por roles: `admin` tiene CRUD completo; `user` solo puede ver y editar su propio perfil
- Borrado lógico: los usuarios se desactivan (`IsActive = false`), nunca se eliminan físicamente
