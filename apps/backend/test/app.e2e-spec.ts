import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  it('/ (GET) - should return 401 without authentication', () => {
    return request(app.getHttpServer()).get('/api/v1').expect(401);
  });

  it('/users/me (GET) - should return 401 without authentication', () => {
    return request(app.getHttpServer()).get('/api/v1/users/me').expect(401);
  });
});
