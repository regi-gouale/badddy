import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserController } from './controllers/user.controller';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { EmailModule } from './modules/email';

@Module({
  imports: [
    // Configuration des variables d'environnement
    ConfigModule.forRoot({
      isGlobal: true, // Rend ConfigModule disponible partout
      envFilePath: '.env', // Chemin vers le fichier .env
    }),
    // Rate Limiting: 10 requêtes par minute par IP
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 secondes
        limit: 10, // 10 requêtes max
      },
    ]),
    EmailModule,
  ],
  controllers: [AppController, UserController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
