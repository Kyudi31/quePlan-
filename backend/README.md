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
