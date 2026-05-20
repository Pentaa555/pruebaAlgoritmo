**Prueba técnica — Full-stack Jr (React/Angular + .NET + SQL Server)**

**Objetivo**

Construir una **app de autenticación + CRUD de usuarios** con **frontend** (React o
Angular), **backend** en **C# (.NET)** y **SQL Server local** , aplicando **JWT** para
autenticación.

**Alcance funcional mínimo**

1. **Registro y Login**
    o Registrar usuario (email único, contraseña segura).
    o Iniciar sesión con **JWT** (access token con vencimiento).
    o Cerrar sesión (opcional: invalidar refresh token).
2. **CRUD de Usuarios**
    o **Listar** , **crear** , **editar** , **eliminar** y **ver** usuario.
    o **Roles** : admin y user.
        admin: puede CRUD de todos.
        user: puede ver/editar **solo su perfil**.
3. **UI**
    o Formulario de **login** y **registro**.
    o Pantalla de **tabla** de usuarios con búsqueda y paginación simple.
    o Formulario para **crear/editar** usuario.

**Requisitos técnicos**

**Backend (.NET)**

- **.NET 7+** (ideal .NET 8), **ASP.NET Core Web API**.
- **SQL Server** local (LocalDB/Express o contenedor Docker).
- **JWT** :
    o Firma con clave simétrica (HS256), **expiración** (p.ej. 15–60 min).


```
o Hash y sal de contraseña (PBKDF2/BCrypt/Argon2). No guardar
contraseñas en texto plano.
```
- **Swagger** habilitado.
- **CORS** para permitir al frontend acceder al API.

**Contratos API (sugeridos)**

- POST /api/auth/register → { email, password, name }
- POST /api/auth/login → { email, password } ⇒ { accessToken, user }
- POST /api/auth/refresh (opcional)
- GET /api/users?search=&page=&size= (admin)
- GET /api/users/{id} (admin o dueño)
- POST /api/users (admin)
- PUT /api/users/{id} (admin o dueño con restricciones)
- DELETE /api/users/{id} (admin)
    **Header** : Authorization: Bearer <token>

**Esquema DB (sugerido)**

Users (

Id UNIQUEIDENTIFIER PK,

Email NVARCHAR(256) UNIQUE NOT NULL,

PasswordHash VARBINARY(MAX) NOT NULL,

PasswordSalt VARBINARY(MAX) NOT NULL,

Name NVARCHAR(150) NOT NULL,

Role NVARCHAR(20) NOT NULL DEFAULT 'user',

IsActive BIT NOT NULL DEFAULT 1,

CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),

UpdatedAt DATETIME2 NULL

)

Se permite PasswordHash como NVARCHAR si se usa BCrypt (string).


**Frontend (React o Angular)**

- **React 18+ (JavaScript)** con Vite o CRA **o Angular 16+**.
- **Ruteo** protegido: ruta pública (login/registro) y rutas privadas (CRUD).
- **Form validation** (react-hook-form/Formik o Reactive Forms en Angular).
- **UI/UX** : diseño limpio, responsive, accesible (focus/teclado, labels, aria).

**Entregables**

- **Repositorio Git** con dos carpetas: frontend/ y backend/.
- **README** (obligatorio) con:
    o Requisitos previos, variables de entorno, conexión a SQL Server.
    o Pasos para ejecutar **backend** y **frontend**.
    o Colección **Postman** o instrucciones Swagger para probar.
- **Script SQL** o **migraciones** para crear DB.
- **Credenciales de prueba** :
    o admin@demo.com / Admin123!
    o user@demo.com / User123!

**Criterios de evaluación (rubrica 100 pts)**

1. **Diseño (UI/UX, responsive, accesibilidad)** – **15 pts**
    o Layout claro, estados de carga/errores, uso razonable de componentes.
2. **Autenticación cifrada (JWT + hash de contraseñas)** – **20 pts**
    o Hash + sal correctos; expiración de token; protección de rutas; no
       exponer datos sensibles.
3. **Conexión con base de datos** – **15 pts**
    o Consultas eficientes; manejo correcto de conexiones.
4. **Funcionamiento (end-to-end)** – **20 pts**


```
o Flujo completo: registro → login → CRUD según rol; validaciones en
cliente/servidor.
```
5. **Crear usuario y autenticarse con él** – **10 pts**
    o Caso feliz y mensajes de error claros.
6. **Calidad de código** – **10 pts**
    o Estructura, separación de capas, nombres claros, linters/formatters.
7. **Documentación y DX (README, Swagger, scripts)** – **10 pts**

**Requisitos eliminatorios (“gatekeepers”):**

- Contraseñas **sin** hash/sal → **descalifica**.
- No corre localmente con instrucciones provistas → **no aprobado**.

**Reglas y restricciones**

- Variables sensibles ( **JWT key** , connection string) **fuera** del repo (user-secrets /
    .env).
- No usar servicios externos de auth (Keycloak, Auth0, etc.).
- El candidato puede elegir **Angular o React** , pero no ambos.

**Guía de implementación (sugerida y breve)**

**Backend**

- Capas: Api / Application / Infrastructure.
- Entidades + DTOs + AutoMapper (opcional).
- Filtros de excepción global + respuesta estándar de errores.
- Autorización por **roles** y/o **políticas**.

**Frontend**

- Rutas: /login, /register, /users, /users/new, /users/:id/edit, /profile.
- Guard/Hook que verifique token y lo renueve (si implementan refresh).
- Tabla con **paginación** y **búsqueda** por email/nombre.


**Testing (deseable)**

- Backend: pruebas de servicios/repositorios mínimos.
- Frontend: pruebas de componentes clave (form de login).

**Escenarios de prueba (para revisar entrega)**

1. **Registro → Login → Acceso**
    o Registro user@demo.com, login exitoso, acceso a /users **denegado** si
       e s u s e r.
2. **Admin CRUD**
    o Con admin@demo.com, crear usuario, editar su nombre, desactivarlo,
       eliminarlo.
3. **Autorización**
    o Un user intentando PUT /api/users/{otroId} → **403**.
4. **To k e n s**
    o Token expirado → vuelve a login (o refresh si implementado).
5. **Validaciones**
    o Email duplicado → **409** o **400** con mensaje entendible.
6. **Resiliencia**
    o Backend caído → frontend muestra error amigable.

**Extras opcionales (para destacar)**

- **Refresh tokens** con lista de revocación.
- **Auditoría** (CreatedBy/UpdatedBy) y **logging** (Serilog).
- **Paginación/ordenamiento/filtrado** en API (no solo cliente).
- **Carga de avatar** (almacenado en disco/local) con validación de tipo/tamaño.
- **Accesibilidad** : navegación por teclado, aria-live para errores.
- **Docker Compose** (API + SQL Server + Front).


- **CI básico** (lint + build).

**Puntos adicionales:**

- **Seguridad adicional** :
    o Política de **contraseñas** , bloqueo tras intentos fallidos, CSRF en
       llamadas no-API si aplica, **rate limiting** básico.
- **Manejo de errores y observabilidad** :
    o Estructura consistente de errores, logs útiles, corrección de estados en
       UI.
- **Arquitectura y patrones** :
    o Separación de capas, SRP, inyección de dependencias,
       repositorios/servicios, DTOs.
- **Escalabilidad y mantenibilidad** :
    o Nombres y estructura de carpetas, reutilización de componentes,
       comentarios justificados.
- **Buenas prácticas de Git** :
    o Commits pequeños y descriptivos, PRs (si simulan), mensajes claros.
- **Accesibilidad y rendimiento** :
    o Lighthouse mínimo aceptable, lazy loading (rutas o módulos), evitar
       renders innecesarios.
- **Comunicación y documentación** :
    o Claridad del README, supuestos, limitaciones y próximos pasos.
- **Calidad de UI** :
    o Microinteracciones, estados vacíos, loaders, feedback.

**Sugerencia de tiempo**

- **6–8 horas** efectivas para el alcance mínimo; extras opcionales si el tiempo lo
    permite.


