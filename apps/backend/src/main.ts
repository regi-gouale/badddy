import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');

  // Filtre d'exceptions global
  app.useGlobalFilters(new AllExceptionsFilter());

  // Activation de la validation globale
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Supprime les propriétés non définies dans le DTO
      forbidNonWhitelisted: true, // Rejette les requêtes avec des propriétés non autorisées
      transform: true, // Transforme automatiquement les types
    }),
  );

  // Configuration CORS sécurisée
  const frontendUrl = process.env.FRONTEND_URL;
  if (process.env.NODE_ENV === 'production' && !frontendUrl) {
    throw new Error('FRONTEND_URL must be set in production');
  }

  app.enableCors({
    origin: frontendUrl || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Configuration Swagger/OpenAPI
  const config = new DocumentBuilder()
    .setTitle('Badddy API')
    .setDescription(
      "API REST pour l'application Badddy\n\n" +
        '## Authentification\n\n' +
        "L'API utilise JWT (JSON Web Tokens) pour l'authentification. " +
        'Les tokens sont fournis par Better Auth.\n\n' +
        'Pour accéder aux endpoints protégés:\n' +
        '1. Obtenez un token JWT via Better Auth\n' +
        '2. Ajoutez le header: `Authorization: Bearer <votre-token>`',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Entrez votre token JWT (obtenu via Better Auth)',
      },
      'JWT-auth',
    )
    .addTag('health', 'Endpoints de santé et statut')
    .addTag('users', 'Gestion des utilisateurs')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/docs', app, document, {
    customSiteTitle: 'Badddy API Documentation',
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;
  await app.listen(port);

  logger.log(`🚀 Application démarrée sur http://localhost:${port}`);
  logger.log(`📚 Documentation Swagger: http://localhost:${port}/api/v1/docs`);
  logger.log(`🔒 Rate Limiting: 10 requêtes/minute par IP`);
}

void bootstrap();
