import './env.loader';

export const APP_CONFIG = Symbol('APP_CONFIG');

export interface AppConfig {
  app: {
    name: string;
    description: string;
    environment: string;
    port: number;
    globalPrefix: string;
  };
  swagger: {
    enabled: boolean;
    path: string;
  };
  validation: {
    transform: boolean;
    whitelist: boolean;
    forbidNonWhitelisted: boolean;
  };
  database: {
    url?: string;
    autoConnect: boolean;
  };
  auth: {
    jwtSecret: string;
    jwtExpiresIn: string;
  };
}

const ALLOWED_NODE_ENVS = ['development', 'test', 'production'] as const;
export const DEFAULT_DATABASE_URL =
  'postgresql://postgres:postgres@localhost:5432/qplan';

export function createAppConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const nodeEnv = env.NODE_ENV?.trim() || 'development';

  if (!ALLOWED_NODE_ENVS.includes(nodeEnv as (typeof ALLOWED_NODE_ENVS)[number])) {
    throw new Error(
      `Invalid NODE_ENV "${nodeEnv}". Allowed values: ${ALLOWED_NODE_ENVS.join(', ')}.`,
    );
  }

  const port = parsePort(env.PORT);
  const databaseUrl = env.DATABASE_URL?.trim();

  if (databaseUrl && !/^postgres(ql)?:\/\//i.test(databaseUrl)) {
    throw new Error(
      'DATABASE_URL must be a valid PostgreSQL connection string starting with postgres:// or postgresql://.',
    );
  }

  return {
    app: {
      name: env.APP_NAME?.trim() || 'QPlan Backend',
      description:
        env.APP_DESCRIPTION?.trim() ||
        'API backend for authentication and future persistence integrations.',
      environment: nodeEnv,
      port,
      globalPrefix: env.API_PREFIX?.trim() || 'api',
    },
    swagger: {
      enabled: parseBoolean(env.SWAGGER_ENABLED, nodeEnv !== 'production'),
      path: sanitizeRouteSegment(env.SWAGGER_PATH, 'docs'),
    },
    validation: {
      transform: parseBoolean(env.VALIDATION_TRANSFORM, true),
      whitelist: parseBoolean(env.VALIDATION_WHITELIST, true),
      forbidNonWhitelisted: parseBoolean(
        env.VALIDATION_FORBID_NON_WHITELISTED,
        true,
      ),
    },
    database: {
      url: databaseUrl,
      autoConnect: parseBoolean(env.DATABASE_AUTO_CONNECT, false),
    },
    auth: {
      jwtSecret: env.JWT_SECRET?.trim() || 'development-secret',
      jwtExpiresIn: env.JWT_EXPIRES_IN?.trim() || '1d',
    },
  };
}

export function getPrismaDatabaseUrl(env: NodeJS.ProcessEnv = process.env) {
  return createAppConfig(env).database.url ?? DEFAULT_DATABASE_URL;
}

function parsePort(rawPort?: string) {
  if (!rawPort) {
    return 3000;
  }

  const port = Number.parseInt(rawPort, 10);

  if (Number.isNaN(port) || port <= 0) {
    throw new Error('PORT must be a positive integer.');
  }

  return port;
}

function parseBoolean(value: string | undefined, fallback: boolean) {
  if (!value) {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();

  if (['true', '1', 'yes', 'on'].includes(normalized)) {
    return true;
  }

  if (['false', '0', 'no', 'off'].includes(normalized)) {
    return false;
  }

  throw new Error(
    `Invalid boolean value "${value}". Use one of: true, false, 1, 0, yes, no, on, off.`,
  );
}

function sanitizeRouteSegment(value: string | undefined, fallback: string) {
  const normalized = value?.trim().replace(/^\/+|\/+$/g, '');
  return normalized || fallback;
}
