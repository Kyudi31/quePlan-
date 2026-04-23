
import './config/env.loader';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AppConfigService } from './config/app-config.service';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(AppConfigService);
  const logger = new Logger('Bootstrap');

  app.setGlobalPrefix(configService.app.globalPrefix);
  app.enableShutdownHooks();
  app.useGlobalPipes(
    new ValidationPipe({
      transform: configService.validation.transform,
      whitelist: configService.validation.whitelist,
      forbidNonWhitelisted: configService.validation.forbidNonWhitelisted,
    }),
  );

  if (configService.swagger.enabled) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle(configService.app.name)
      .setDescription(configService.app.description)
      .setVersion('1.0.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(
      `${configService.app.globalPrefix}/${configService.swagger.path}`,
      app,
      document,
    );
  }

  await app.get(PrismaService).connectIfEnabled();
  await app.listen(configService.app.port);

  logger.log(
    `${configService.app.name} listening on port ${configService.app.port} in ${configService.app.environment}.`,
  );
}
bootstrap();
