# Auth + User CRUD App — Design Spec

**Date:** 2026-05-19
**Stack:** React 18 + Vite · .NET 8 Clean Architecture · SQL Server (Docker)
**Scope:** Core + extras (refresh tokens, server-side pagination/search, Serilog)

---

## Context

This is a full-stack Jr technical test. The goal is to build an authentication + user CRUD application scored on a 100-point rubric covering UI/UX, security, DB integration, end-to-end functionality, code quality, and documentation. Two eliminatory requirements: passwords must be hashed, and the app must run locally from README instructions.

---

## Hard Rules

- **No Claude branding anywhere** — no "Co-Authored-By: Claude", no mentions of Claude, Anthropic, or any AI tool in commit messages, code comments, README, Swagger descriptions, or any file delivered as part of the submission.
- **No AI-generated boilerplate markers** — remove any auto-generated headers or footers that reference code generation tools.
- All content must read as written by the candidate.

---

## Architecture

Three-tier Clean Architecture backend + React SPA frontend + SQL Server in Docker.

```
frontend/          React 18 + Vite (blue corporate UI)
backend/
  UserApp.Api/           Controllers, JWT middleware, Swagger, CORS, global error filter
  UserApp.Application/   Services, DTOs, interfaces, pagination models
  UserApp.Infrastructure/ EF Core, repositories, BCrypt, JWT token service, Serilog
```

The frontend and backend live in separate folders in the same repository. They communicate over HTTP; the frontend never touches the database directly.

---

## Database

SQL Server running in a Docker container. Schema managed via EF Core migrations. Seeded with two demo users on first run.

### Users

| Column | Type | Notes |
|---|---|---|
| Id | UNIQUEIDENTIFIER PK | `Guid.NewGuid()` |
| Email | NVARCHAR(256) UNIQUE NOT NULL | |
| PasswordHash | NVARCHAR(MAX) NOT NULL | BCrypt string (salt embedded) |
| Name | NVARCHAR(150) NOT NULL | |
| Role | NVARCHAR(20) NOT NULL DEFAULT 'user' | `'admin'` or `'user'` |
| IsActive | BIT NOT NULL DEFAULT 1 | Soft-delete flag |
| CreatedAt | DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME() | |
| UpdatedAt | DATETIME2 NULL | Set on every PUT |

### RefreshTokens

| Column | Type | Notes |
|---|---|---|
| Id | UNIQUEIDENTIFIER PK | |
| UserId | UNIQUEIDENTIFIER FK → Users.Id | Cascade delete |
| Token | NVARCHAR(512) UNIQUE NOT NULL | Random GUID |
| ExpiresAt | DATETIME2 NOT NULL | 7 days from creation |
| RevokedAt | DATETIME2 NULL | Set on logout or rotation |
| CreatedAt | DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME() | |

**Decisions:**
- BCrypt stores the salt inside the hash string — no separate `PasswordSalt` column needed.
- DELETE is a soft-delete: sets `IsActive = false`. Rows are never physically removed.

---

## API Contracts

All protected endpoints require `Authorization: Bearer <accessToken>`.

### Auth (public)

| Method | Path | Body | Response |
|---|---|---|---|
| POST | /api/auth/register | `{ email, password, name }` | `201 { user }` |
| POST | /api/auth/login | `{ email, password }` | `200 { accessToken, refreshToken, user }` |
| POST | /api/auth/refresh | `{ refreshToken }` | `200 { accessToken, refreshToken }` |

### Auth (bearer required)

| Method | Path | Notes |
|---|---|---|
| POST | /api/auth/logout | Revokes the provided refresh token |

### Users (bearer required)

| Method | Path | Authorization | Notes |
|---|---|---|---|
| GET | /api/users?search=&page=&size= | admin | Server-side pagination + search by name/email |
| GET | /api/users/:id | admin OR own | |
| POST | /api/users | admin | `{ email, password, name, role }` |
| PUT | /api/users/:id | admin (full) · own (name only) | Admin can change role; user cannot change email or role |
| DELETE | /api/users/:id | admin | Soft-delete (IsActive = false) |

**Standard error shape:**
```json
{ "status": 400, "message": "Email already in use.", "errors": {} }
```

HTTP status codes: `400` validation, `401` unauthenticated, `403` forbidden, `404` not found, `409` duplicate email.

---

## Auth Flow

### Login / Register
1. Client sends credentials to `/api/auth/login`.
2. Backend verifies BCrypt hash → generates access token (HS256, 30 min) + refresh token (random GUID, 7 days) → persists refresh token row in DB.
3. Response: `{ accessToken, refreshToken, user }`. Frontend stores access token in memory (AuthContext state, cleared on page refresh) and refresh token in `localStorage`.
4. Axios sets `Authorization: Bearer <accessToken>` on every subsequent request.

### Silent Token Refresh
1. Any API call returns 401.
2. Axios interceptor catches it → POST `/api/auth/refresh` with stored refresh token.
3. Backend validates token (exists, not revoked, not expired) → issues new access token + rotates refresh token (old row revoked, new row created).
4. Interceptor retries the original request with the new access token — transparent to the user.
5. If refresh also fails → clear tokens → redirect to `/login`.

### Logout
1. POST `/api/auth/logout` → server sets `RevokedAt` on the refresh token row.
2. Frontend clears tokens from memory → redirects to `/login`.

---

## Backend Layer Responsibilities

### UserApp.Api
- Controllers: `AuthController`, `UsersController`
- JWT bearer authentication configured in `Program.cs`
- CORS policy allowing the frontend origin
- Swagger with bearer auth support
- Global exception filter returning the standard error shape
- Serilog request logging middleware

### UserApp.Application
- `IAuthService` / `AuthService`: register, login, refresh, logout logic
- `IUserService` / `UserService`: CRUD + role-based access checks
- `IUserRepository`, `IRefreshTokenRepository`: repository interfaces
- `ITokenService`: interface for JWT + refresh token generation
- DTOs: `RegisterDto`, `LoginDto`, `UserDto`, `CreateUserDto`, `UpdateUserDto`, `PagedResult<T>`
- FluentValidation validators for all DTOs

### UserApp.Infrastructure
- `AppDbContext` (EF Core) with `Users` and `RefreshTokens` DbSets
- `UserRepository`, `RefreshTokenRepository`: EF Core implementations
- `TokenService`: generates HS256 JWT + random refresh token GUIDs
- `PasswordService`: BCrypt hash + verify wrappers
- Serilog configuration (console + rolling file sink)
- EF Core migrations + data seeder

---

## Frontend Structure

```
frontend/src/
  api/           axiosInstance.ts  (interceptor for auth + refresh)
  context/       AuthContext.tsx   (user state, login/logout helpers)
  components/    Navbar, PrivateRoute, AdminRoute, UserForm, UserTable, Pagination
  pages/         LoginPage, RegisterPage, UsersPage, UserFormPage, ProfilePage
  hooks/         useAuth.ts
```

### Routes

| Path | Access | Component |
|---|---|---|
| /login | public | LoginPage |
| /register | public | RegisterPage |
| /users | admin only | UsersPage (table + search + pagination) |
| /users/new | admin only | UserFormPage (create mode) |
| /users/:id/edit | admin only | UserFormPage (edit mode) |
| /profile | any authenticated | ProfilePage |

A `user` role hitting `/users` is redirected to `/profile` by the route guard. The server also enforces the restriction and returns 403.

### Key Frontend Decisions
- **react-hook-form** for form validation (register, login, create/edit user)
- **Axios instance** with request interceptor (attach token) and response interceptor (handle 401 → refresh → retry)
- **AuthContext** holds `{ user, accessToken }` in React state (in-memory); refresh token in `localStorage` only
- **React Router v6** with `<Outlet>` for protected layout wrapping

---

## Extras Included

| Extra | Implementation |
|---|---|
| Refresh tokens | DB-stored, rotated on use, revoked on logout |
| Server-side pagination + search | `GET /api/users?search=&page=&size=` — EF Core `Skip/Take` + `Where` on name/email |
| Serilog structured logging | Console + rolling file sink; logs auth events and errors with context |

---

## Error Handling

- **Backend**: global exception filter catches all unhandled exceptions, logs them via Serilog, returns `{ status, message }` JSON — no stack traces in production.
- **Frontend**: Axios interceptor surfaces API errors; forms show inline field errors; a top-level error boundary catches unexpected crashes with a friendly message.

---

## Demo Credentials (seeded)

| Email | Password | Role |
|---|---|---|
| admin@demo.com | Admin123! | admin |
| user@demo.com | User123! | user |

---

## Verification

1. `docker compose up -d` → starts SQL Server container.
2. `cd backend && dotnet run --project UserApp.Api` → applies migrations, seeds DB, starts API on `https://localhost:5001`.
3. Open Swagger at `https://localhost:5001/swagger` → test register, login, CRUD flows.
4. `cd frontend && npm install && npm run dev` → starts Vite on `http://localhost:5173`.
5. Log in as `admin@demo.com` → verify full CRUD, pagination, search.
6. Log in as `user@demo.com` → verify redirect to `/profile`, 403 on `/users`.
7. Let access token expire (or shorten expiry to 1 min for testing) → verify silent refresh.
8. Logout → verify refresh token rejected on next attempt.

---

## Optional: AWS Deployment (after local app is complete)

Deploy to AWS free tier so evaluators can test a live URL without running the app locally. Tackle this only after the local app is fully working and polished.

### Infrastructure

| What | AWS Service | Notes |
|---|---|---|
| .NET API + SQL Server | EC2 t2.micro | SQL Server runs in Docker on the instance (RDS SQL Server not free tier) |
| React SPA | AWS Amplify or S3 static hosting | Build output of `npm run build` |
| Secrets | EC2 environment variables or AWS SSM Parameter Store | JWT key, DB connection string |

### Steps (high level)

1. **EC2**: launch a t2.micro (Amazon Linux 2023), install Docker, copy the backend + `docker-compose.yml`, set environment variables, run `dotnet publish` and start the API behind a `systemd` service or directly in Docker.
2. **Security group**: open port 5001 (or 80 via nginx reverse proxy) for the frontend origin; open port 1433 only to localhost.
3. **Frontend**: update `VITE_API_BASE_URL` to the EC2 public IP/domain, run `npm run build`, deploy to Amplify (connect repo) or upload `dist/` to an S3 bucket with static website hosting enabled.
4. **CORS**: update the backend CORS policy to allow the Amplify/S3 origin.
5. **README**: add a "Live demo" section with the public URL and the demo credentials.

### Key risks
- EC2 public IP changes on restart unless an Elastic IP is assigned (free while the instance is running).
- SQL Server in Docker on a t2.micro (1 GB RAM) is tight — set `MSSQL_MEMORY_LIMIT_MB=512` in the compose file.
- HTTPS requires a domain + certificate (Let's Encrypt via Certbot or ACM); HTTP is acceptable for a demo if noted in the README.
