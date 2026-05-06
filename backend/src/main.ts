import './config/env.loader';
import { Logger, ValidationPipe } from '@nestjs/common';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();




/*import 'dotenv/config';   //Hice un cambio aqui para que funcionara la puta base de datos.

hice un cambio aquí

>>>>>>> origin/feature/plan-management
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
const app = await NestFactory.create(AppModule);
const logger = new Logger('Bootstrap');

app.setGlobalPrefix('api'); // temporal hardcode
app.enableShutdownHooks();

app.useGlobalPipes(
new ValidationPipe({
transform: true,
whitelist: true,
forbidNonWhitelisted: true,
}),
);

await app.listen(3000); // puerto temporal

logger.log(`App running on http://localhost:3000/api`);
}

bootstrap();
*/