# Backend de quePlan

API del proyecto `quePlan` construida con NestJS y TypeScript.

## Stack actual

- NestJS 11
- TypeScript
- JWT para autenticación
- `class-validator` y `class-transformer` para validación de DTOs
- Prisma y `pg` instalados como preparación para una futura integración ordenada con PostgreSQL

## Alcance actual de base de datos

La base de datos no debe considerarse implementada todavía. Aunque existen dependencias relacionadas con Prisma/PostgreSQL, este backend sigue en etapa de organización de arquitectura y contratos.

Eso significa:

- No asumir persistencia real en todos los módulos.
- No crear nuevas convenciones locales de variables para base de datos.
- No mezclar documentación antigua de Express/Sequelize con la estructura actual de NestJS.

## Instalación

```bash
npm install
```

## Variables de entorno

Usa `backend/.env.example` como plantilla local.

Variables esperadas:

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=change-this-in-local-and-production
JWT_EXPIRES_IN=1d
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/queplan?schema=public"
```

### Convención importante

Para la futura integración con Prisma, la variable estándar de conexión será `DATABASE_URL`.

Evita volver a introducir combinaciones como:

- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`

Esa fragmentación suele generar diferencias entre máquinas, scripts y documentación. Si más adelante se necesitan variables adicionales, deben documentarse sin reemplazar `DATABASE_URL` como contrato principal.

## Scripts principales

```bash
npm run start
npm run start:dev
npm run build
npm run test
npm run test:e2e
```

## Objetivo de la arquitectura

Antes de conectar PostgreSQL de forma definitiva, el backend debe quedar ordenado para que varios desarrolladores puedan trabajar sin romper configuración, contratos o módulos.

Las decisiones de documentación en este repositorio ya quedan orientadas a ese objetivo:

- stack real documentado
- variables de entorno consistentes
- expectativa explícita de Prisma/PostgreSQL a futuro
- separación clara entre backend y frontend

## Próximo paso recomendado

Cuando el equipo habilite la persistencia real, conviene documentar junto con el cambio:

1. cómo levantar PostgreSQL localmente
2. cómo ejecutar migraciones
3. cómo generar el cliente de Prisma
4. qué módulo o capa de infraestructura centraliza la conexión

---

## Arquitectura: Módulo de Autenticación y Usuarios

Este backend implementa un módulo de autenticación completamente funcional con persistencia en **PostgreSQL + Prisma**. A continuación se describe la estructura, responsabilidades y flujo de datos.

### Visión General

```
┌─────────────────────────────────────────────────────────────┐
│                     HTTP CLIENT                              │
└──────────────────────┬──────────────────────────────────────┘
                       │
         ┌─────────────┼─────────────┐
         │             │             │
    POST /auth/    POST /auth/    GET /users/:id
    register       login           PATCH /users/:id
         │             │             │
         └─────────────┼─────────────┘
                       │
         ┌─────────────▼──────────────┐
         │   AuthController           │
         │   UsersController          │
         │   (Validación: DTOs)       │
         └─────────────┬──────────────┘
                       │
         ┌─────────────▼──────────────┐
         │   AuthService              │
         │   UsersService             │
         │   (Lógica de negocio)      │
         └─────────────┬──────────────┘
                       │
         ┌─────────────▼──────────────┐
         │   UsersRepository          │
         │   (Interfaz: contrato)     │
         └─────────────┬──────────────┘
                       │
         ┌─────────────▼──────────────┐
         │ PrismaUsersRepository      │
         │ (Implementación Prisma)    │
         └─────────────┬──────────────┘
                       │
         ┌─────────────▼──────────────┐
         │   PrismaService            │
         │   (Cliente Prisma)         │
         └─────────────┬──────────────┘
                       │
         ┌─────────────▼──────────────┐
         │   PostgreSQL (Docker)      │
         │   (Persistencia)           │
         └────────────────────────────┘
```

### Capas y Responsabilidades

#### 1. **Capa HTTP (Controllers)**

**Archivos:**
- `src/modules/auth/auth.controller.ts` - Endpoints `/auth/register`, `/auth/login`
- `src/modules/users/users.controller.ts` - Endpoints `/users/:id`, `/users/:id` (PATCH)

**Responsabilidades:**
- Mapear rutas HTTP a métodos de servicio
- Validar DTOs (class-validator) - rechaza requests inválidas con 400
- Serializar respuestas (sin incluir `passwordHash`)
- NO contiene lógica de negocio

**Flujo:**
```
HTTP Request
    ↓
DTO Validation (email, password, etc.)
    ↓ (si válido)
Controller → Llama servicio
    ↓
Service retorna resultado
    ↓
Controller serializa respuesta (toPublicJSON)
    ↓
HTTP Response (200, 409, 401, 404, etc.)
```

#### 2. **Capa de Lógica (Services)**

**Archivos:**
- `src/modules/auth/auth.service.ts` - Lógica de autenticación
- `src/modules/users/users.service.ts` - Lógica de gestión de usuarios

**AuthService - Métodos:**

| Método | Responsabilidad | Flujo |
|--------|-----------------|-------|
| `register(dto)` | Crear nuevo usuario | Hash(pwd) → User.create() → repo.save() → JWT |
| `login(dto)` | Autenticar usuario | findByEmail → compare(pwd) → JWT |
| `buildAuthResponse()` | Construir respuesta auth | { user: públicos, accessToken: JWT } |

**UsersService - Métodos:**

| Método | Responsabilidad | Flujo |
|--------|-----------------|-------|
| `create(input)` | Crear usuario con validaciones | Valida email único → User.create() → repo.save() |
| `findById(id)` | Buscar por ID, 404 si no existe | repo.findById() → lanza NotFoundException |
| `findByEmail(email)` | Buscar por email, null si no existe | repo.findByEmail() → retorna User \| null |
| `updateProfile(id, updates)` | Actualizar perfil | findById() → user.updateProfile() → repo.save() |

**Validaciones de Negocio:**
- Email único (valida antes de crear)
- Estructura de usuario (name 2+, email válido, passwordHash ≥20 chars)
- Passwords hashadas con bcrypt 10 rounds (~100ms)

#### 3. **Capa de Acceso a Datos (Repository Pattern)**

**Archivos:**
- `src/modules/users/users.repository.ts` - Interfaz (contrato)
- `src/modules/users/infrastructure/prisma-users.repository.ts` - Implementación Prisma
- `src/modules/users/infrastructure/in-memory-users.repository.ts` - Alternativa (desarrollo)

**UsersRepository - Interfaz (Contrato):**
```typescript
interface UsersRepository {
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  save(user: User): Promise<User>
}
```

**PrismaUsersRepository - Implementación:**

| Método | Query SQL | Mapeo |
|--------|-----------|-------|
| `findById(id)` | SELECT FROM "User" WHERE id = $1 | DB → User entity |
| `findByEmail(email)` | SELECT FROM "User" WHERE email = $1 | DB → User entity |
| `save(user)` | UPSERT (INSERT OR UPDATE) | User entity → DB |

**Características:**
- Queries async/await (no bloquea)
- Error handling: logea errores, retorna null (permite manejo en service)
- Mapeo automático: UserRole.Admin ↔ 'ADMIN' (enum BD)
- UPSERT: maneja creación y actualización sin duplicar lógica

#### 4. **Capa de Dominio (Entity)**

**Archivos:**
- `src/modules/users/user.entity.ts` - Lógica de dominio puro

**Responsabilidades:**
- Representar usuario como objeto immutable
- Validar integridad de datos
- Proporcionar transformaciones (toJSON, toPublicJSON, toJwtPayload)

**Métodos principales:**
- `User.create(props)` - Factory que normaliza, valida y retorna nueva instancia
- `updateProfile(updates)` - Retorna NUEVA instancia (patrón immutable)
- `toPublicJSON()` - Excluye passwordHash (seguridad)
- `toJwtPayload()` - Prepara datos para JWT

**Validaciones Automáticas:**
- ID requerido y no vacío
- Email formato válido (regex simple)
- passwordHash ≥20 chars (indica hash bcrypt)
- name 2-n caracteres si está definido
- timestamps son Date válidos

### Flujos de Negocio

#### Flujo 1: REGISTRO (POST /auth/register)

```
1. Cliente envía:
   {
     "email": "john@example.com",
     "password": "securePass123",  // NUNCA se almacena en texto
     "name": "John Doe"
   }

2. AuthController valida DTO:
   - Email: @IsEmail()
   - Password: @MinLength(4) @MaxLength(12)
   - Name: @MinLength(2) @MaxLength(80)
   → Si falla: 400 Bad Request

3. AuthService.register():
   - Genera UUID para user.id
   - Hash bcrypt de password (10 rounds):
     password = "securePass123"
     passwordHash = "$2b$10$..." (60 chars)
   - Llama UsersService.create()

4. UsersService.create():
   - Normaliza email a lowercase
   - Verifica unicidad en BD: SELECT FROM "User" WHERE email = $1
   - Si existe: 409 Conflict ("Email is already registered")
   - Si no existe: User.create() → validaciones dominio
   - Llama repo.save() → UPSERT en BD

5. PrismaUsersRepository.save():
   - Prepara datos (convierte enum role)
   - Ejecuta SQL: INSERT INTO "User" (...)
   - BD retorna user con IDs generados
   - Mapea resultado a User entity
   - Retorna user guardada

6. AuthService.buildAuthResponse():
   - user.toPublicJSON() → { id, email, name, role, dates }
   - jwtService.signAsync(user.toJwtPayload())
     → JWT token con { sub: id, email, role, exp: +1d }

7. Controller retorna respuesta 201:
   {
     "user": {
       "id": "550e8400...",
       "email": "john@example.com",
       "name": "John Doe",
       "role": "user",
       "createdAt": "2026-04-29T...",
       "updatedAt": "2026-04-29T..."
     },
     "accessToken": "eyJhbGciOiJIUzI1NiI..."
   }

8. Cliente almacena token y lo envía en requests futuros:
   Authorization: Bearer eyJhbGciOiJIUzI1NiI...
```

#### Flujo 2: LOGIN (POST /auth/login)

```
1. Cliente envía:
   {
     "email": "john@example.com",
     "password": "securePass123"
   }

2. AuthController valida DTO
   → Si falla: 400 Bad Request

3. AuthService.login():
   - Llama UsersService.findByEmail()

4. UsersService.findByEmail():
   - Llama repo.findByEmail()

5. PrismaUsersRepository.findByEmail():
   - Ejecuta SQL: SELECT FROM "User" WHERE email = $1
   - Si no existe: retorna null
   - Si existe: mapea DB → User entity y retorna

6. De vuelta en AuthService.login():
   - Si user es null: lanza 401 ("Invalid credentials")
     (mensaje genérico por seguridad: no revela si email existe)
   - Si existe: compara password
     bcrypt.compare("securePass123", "$2b$10$...")
     → retorna true si coincide, false si no
   - Si no coincide: lanza 401 ("Invalid credentials")

7. Si coincide:
   - Construye AuthResponse (como en registro)
   - Retorna { user, accessToken }

8. Cliente almacena token
```

#### Flujo 3: ACTUALIZAR PERFIL (PATCH /users/:id)

```
1. Cliente envía:
   {
     "name": "Jane Doe"
   }
   Con header:
   Authorization: Bearer <token>

2. UsersController.update() valida DTO
   → Si falla: 400 Bad Request

3. UsersService.updateProfile():
   - Llama findById() para verificar que usuario existe
   - Si no existe: 404 Not Found
   - Si existe: obtiene user actual

4. user.updateProfile({ name: "Jane Doe" }):
   - Crea NUEVA instancia con cambios
   - Normaliza nombre, valida estructura
   - Retorna nueva instancia

5. Llama repo.save() con nueva instancia
   - SQL: UPDATE "User" SET name = $1, updatedAt = $2 WHERE id = $3
   - Retorna user actualizada

6. Controller retorna { id, email, name: "Jane Doe", ... }
```

### Inyección de Dependencias (NestJS Pattern)

**Problema que resuelve:**
- Desacoplar implementaciones concretas de interfaces
- Facilitar testing con mocks
- Permitir cambio de BD sin reescribir servicios

**Solución:**

```typescript
// users.repository.ts
export const USERS_REPOSITORY = Symbol('USERS_REPOSITORY');
export interface UsersRepository {
  findById(id: string): Promise<User | null>;
  // ...
}

// users.module.ts - PRODUCCIÓN (Prisma)
@Module({
  providers: [
    UsersService,
    PrismaUsersRepository,
    {
      provide: USERS_REPOSITORY,  // Token
      useExisting: PrismaUsersRepository  // Implementación
    }
  ]
})

// users.service.ts - El servicio NO conoce la implementación
@Injectable()
export class UsersService {
  constructor(
    @Inject(USERS_REPOSITORY)  // Inyecta por token
    private readonly usersRepository: UsersRepository
  ) {}
}
```

**Si cambias de BD (ej: MongoDB):**
```typescript
// users.module.ts - ALTERNATIVO (MongoDB)
@Module({
  providers: [
    UsersService,
    MongoUsersRepository,  // Nueva implementación
    {
      provide: USERS_REPOSITORY,
      useExisting: MongoUsersRepository
    }
  ]
})

// UsersService NO necesita cambios!
```

### Seguridad Implementada

| Aspecto | Implementación |
|--------|-----------------|
| Contraseñas | bcrypt 10 rounds (~100ms), NUNCA texto plano |
| Validación | class-validator (DTOs), User.create() (dominio) |
| JWT | Firmado con secret, expiración +1d |
| Errores auth | Mensajes genéricos (no revelan si email existe) |
| Email único | UNIQUE constraint en BD + validación service |
| HTTP respuestas | toPublicJSON() excluye passwordHash |
| CORS | Debe configurarse en main.ts (no está en scope actual) |

### Cómo Extender el Módulo

**Agregar campo a usuario (ej: phone):**

1. Schema Prisma:
```prisma
model User {
  // ... otros campos
  phone String?
}
```

2. Migración:
```bash
npx prisma migrate dev --name add_phone_to_user
```

3. User entity (src/modules/users/user.entity.ts):
```typescript
export interface UserProps {
  // ...
  phone?: string | null;
}
```

4. Controller/DTO nuevos si es necesario

5. Servicios heredan automáticamente (Prisma genera tipos)

**Cambiar de Prisma a otra BD:**

1. Crear `src/modules/users/infrastructure/mongo-users.repository.ts`
2. Implementar interfaz `UsersRepository`
3. En `users.module.ts`: cambiar provider
4. Resto del código sin cambios

**Agregar validaciones adicionales:**

1. En `user.entity.ts`: `validateUserStructure()`
2. O agregar validadores al DTO si es HTTP-específico

### Testing

Cada capa es testeable de forma aislada:

**Test unitario (Entity):**
```typescript
const user = User.create({
  id: "123",
  email: "test@example.com",
  passwordHash: "$2b$10$...",
  name: "Test"
});
expect(user.email).toBe("test@example.com");
```

**Test unitario (Service - mock repository):**
```typescript
const mockRepo = { findByEmail: jest.fn().mockResolvedValue(null) };
const service = new UsersService(mockRepo);
await service.create({ ... });
expect(mockRepo.save).toHaveBeenCalled();
```

**Test E2E (request HTTP completo):**
```typescript
await request(app.getHttpServer())
  .post('/auth/register')
  .send({ email: "test@example.com", password: "pwd", name: "Test" })
  .expect(201)
  .expect((res) => {
    expect(res.body.accessToken).toBeDefined();
  });
```

### Próximos Pasos Recomendados

1. **Agregar JwtAuthGuard** para proteger endpoints
2. **Implementar refresh tokens** (si se necesita rotación)
3. **Agregar rate limiting** en /auth/login
4. **Agregar email verification** (confirmar email antes de usar)
5. **Implementar roles y permisos** (autorización fina-grained)
6. **Tests unitarios** para todos los servicios
7. **Tests E2E** para flujos completos
