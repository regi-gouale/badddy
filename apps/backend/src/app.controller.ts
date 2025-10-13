import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from './decorators/public.decorator';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary: 'Health check',
    description:
      "Point d'entrée public pour vérifier l'état de l'API. " +
      "N'exige pas d'authentification.",
  })
  @ApiResponse({
    status: 200,
    description: 'API fonctionnelle',
    schema: {
      type: 'string',
      example: 'Hello World!',
    },
  })
  @ApiResponse({
    status: 429,
    description: 'Trop de requêtes - Rate limit dépassé (10 req/min)',
  })
  getHello(): string {
    return this.appService.getHello();
  }
}
