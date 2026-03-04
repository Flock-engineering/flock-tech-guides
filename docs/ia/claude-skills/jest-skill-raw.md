---
id: jest-skill-raw
title: "SKILL.md — Jest"
sidebar_label: "SKILL.md"
---

# SKILL.md — Jest

Archivo de instrucciones que Claude usa internamente. Si encontrás algo para mejorar, abrí un PR directamente.

:::info Contribuir
[✏️ Sugerir corrección en GitHub](https://github.com/Flock-engineering/flock-tech-guides/edit/dev/static/skills/jest/SKILL.md) — GitHub te propone hacer fork y PR automáticamente si no tenés permisos de push.
:::

[⬇ Descargar SKILL.md](/flock-tech-guides/skills/jest/SKILL.md)

---

````md
---
name: jest
description: >
  Testing con Jest y Supertest.
  Trigger: escribir tests unitarios, tests E2E, mocks, fixtures
license: MIT
metadata:
  author: tu-proyecto
  version: '1.0'
  scope: [root]
  auto_invoke:
    - 'Escribir test unitario'
    - 'Escribir test E2E'
    - 'Crear mock'
    - 'Agregar fixture'
    - 'Testear service'
    - 'Testear controller'
allowed-tools: Read, Edit, Write, Glob, Grep, Bash
---

# Jest Skill

## Critical Rules

### ALWAYS

- Nombrar archivos: `{feature}.spec.ts` (unit) o `{feature}.e2e-spec.ts` (E2E)
- Mockear dependencias externas (DB, APIs)
- Usar `describe` para agrupar tests relacionados
- Usar nombres descriptivos en `it`/`test`
- Limpiar mocks entre tests con `beforeEach`

### NEVER

- Testear contra base de datos real en unit tests
- Dejar tests dependientes entre sí
- Usar `any` en mocks sin tipado
- Skipear tests sin razón documentada

---

## Unit Test Pattern

```typescript
// {feature}.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { FeatureService } from './feature.service';
import { PrismaService } from '../prisma/prisma.service';

describe('FeatureService', () => {
  let service: FeatureService;
  let prisma: PrismaService;

  const mockPrismaService = {
    feature: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeatureService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<FeatureService>(FeatureService);
    prisma = module.get<PrismaService>(PrismaService);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return array of features', async () => {
      const mockFeatures = [{ id: '1', name: 'Feature 1' }];
      mockPrismaService.feature.findMany.mockResolvedValue(mockFeatures);

      const result = await service.findAll();

      expect(result).toEqual(mockFeatures);
      expect(prisma.feature.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
      });
    });
  });

  describe('findOne', () => {
    it('should return a feature by id', async () => {
      const mockFeature = { id: '1', name: 'Feature 1', isActive: true };
      mockPrismaService.feature.findUnique.mockResolvedValue(mockFeature);

      const result = await service.findOne('1');

      expect(result).toEqual(mockFeature);
    });

    it('should throw NotFoundException when feature not found', async () => {
      mockPrismaService.feature.findUnique.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
```

---

## E2E Test Pattern

```typescript
// test/{feature}.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('FeatureController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prisma = app.get(PrismaService);

    // Get auth token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@test.com', password: 'password' });
    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /features', () => {
    it('should return 401 without auth', () => {
      return request(app.getHttpServer()).get('/features').expect(401);
    });

    it('should return features with auth', () => {
      return request(app.getHttpServer())
        .get('/features')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('POST /features', () => {
    it('should create a feature', () => {
      return request(app.getHttpServer())
        .post('/features')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'New Feature', description: 'Test' })
        .expect(201)
        .expect((res) => {
          expect(res.body.name).toBe('New Feature');
          expect(res.body.id).toBeDefined();
        });
    });

    it('should validate required fields', () => {
      return request(app.getHttpServer())
        .post('/features')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);
    });
  });
});
```

---

## Mock Patterns

### Mock Service

```typescript
const mockService = {
  findAll: jest.fn().mockResolvedValue([]),
  findOne: jest.fn().mockResolvedValue({ id: '1' }),
  create: jest.fn().mockImplementation((dto) => ({ id: 'new', ...dto })),
};
```

### Mock with Implementation

```typescript
mockPrismaService.feature.findUnique.mockImplementation((args) => {
  if (args.where.id === 'valid-id') {
    return Promise.resolve({ id: 'valid-id', name: 'Test' });
  }
  return Promise.resolve(null);
});
```

### Spy on Method

```typescript
const spy = jest.spyOn(service, 'findOne');
await service.someMethod();
expect(spy).toHaveBeenCalledWith('expected-id');
```

---

## Test Commands

```bash
# Run all unit tests
npm test

# Run specific test file
npm test -- feature.service.spec

# Watch mode
npm run test:watch

# Coverage report
npm run test:cov

# E2E tests
npm run test:e2e

# Debug mode
npm run test:debug
```

---

## Project Test Locations

- Unit tests: `src/**/*.spec.ts`
- E2E tests: `test/*.e2e-spec.ts`
- E2E config: `test/jest-e2e.json`
````
