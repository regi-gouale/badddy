import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';

describe('EmailService', () => {
  let service: EmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'USESEND_APIKEY') {
                return 'us_test_key';
              }
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('initialization', () => {
    it('should throw error if USESEND_APIKEY is not defined', async () => {
      const modulePromise = Test.createTestingModule({
        providers: [
          EmailService,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn(() => null),
            },
          },
        ],
      }).compile();

      await expect(modulePromise).rejects.toThrow('USESEND_APIKEY is required');
    });
  });

  describe('sendEmail', () => {
    it('should strip HTML tags correctly', () => {
      const html = '<h1>Hello</h1><p>World</p>';
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      const result = (service as any).stripHtml(html) as string;
      expect(result).toBe('HelloWorld'); // Pas d'espace entre les balises
    });

    it('should handle multiple spaces', () => {
      const html = '<p>Hello    World</p>';
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      const result = (service as any).stripHtml(html) as string;
      expect(result).toBe('Hello World');
    });

    it('should trim whitespace', () => {
      const html = '  <p>Hello</p>  ';
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      const result = (service as any).stripHtml(html) as string;
      expect(result).toBe('Hello');
    });
  });

  // Note: Les tests d'envoi réels nécessitent soit un mock de useSend
  // soit une clé API valide dans un environnement de test
  // Pour des tests réels, utilisez un service de test email comme Mailtrap
});
