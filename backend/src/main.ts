import './config/env.loader';
import { Logger, ValidationPipe } from '@nestjs/common';
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
