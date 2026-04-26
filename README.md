# quePlan

Monorepo del proyecto `quePlan` con dos aplicaciones principales:

- `frontend/`: cliente web separado del backend.
- `backend/`: API construida con NestJS y TypeScript.

## Estado actual del stack

- Backend: NestJS, TypeScript, JWT, validaciones con `class-validator`.
- Frontend: aplicación separada en su propia carpeta.
- Base de datos: la integración con Prisma/PostgreSQL está planificada y parte de las dependencias ya existen en `backend/`, pero la base de datos no se considera integrada todavía.

## Objetivo de esta organización

Este repositorio busca que el equipo pueda trabajar sin ambiguedades entre capas de aplicación, configuración y persistencia. Por eso:

- La lógica del backend se desarrolla dentro de `backend/`.
- La documentación y variables de entorno deben mantener coherencia con el stack real.
- La futura conexión con Prisma/PostgreSQL debe apoyarse en convenciones estables, no en configuraciones improvisadas por desarrollador.

## Estructura general

```text
quePlan-/
|-- backend/
|-- frontend/
|-- .env.example
|-- docker-compose.yml
```

## Variables de entorno del proyecto

El repositorio raíz mantiene un `.env.example` pensado como referencia compartida para el equipo. La convención objetivo para base de datos es:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME?schema=public"
```

Aunque la base de datos todavía no se conecta de forma completa, esta convención deja preparado el camino para Prisma y evita que cada desarrollador use nombres distintos para las mismas credenciales.

## Primeros pasos

1. Clona el repositorio.
2. Crea tus archivos `.env` a partir de los ejemplos disponibles.
3. Instala dependencias dentro de cada aplicación que vayas a trabajar.

Ejemplo para backend:

```bash
cd backend
npm install
```

## Siguientes pasos recomendados para el equipo

- Mantener `README.md` y `backend/README.md` sincronizados con la arquitectura real.
- Evitar introducir nuevas variables de entorno para base de datos fuera de `DATABASE_URL`, salvo que exista una decisión técnica documentada.
- Cuando se habilite Prisma, documentar el flujo completo de migraciones, generación de cliente y conexión local a PostgreSQL.
