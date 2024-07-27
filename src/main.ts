import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import cookieParser from 'cookie-parser';
import { TransformInterceptor } from './core/transform.interceptor';
import { RoleGuard } from './core/role.guard';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get(ConfigService);

  const reflector = app.get(Reflector);

  //Enable global pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  //Enable global guard
  app.useGlobalGuards(new JwtAuthGuard(reflector));
  app.useGlobalGuards(new RoleGuard(reflector));

  //Enable global interceptor
  app.useGlobalInterceptors(new TransformInterceptor(reflector));

  //config static file
  app.useStaticAssets(join(__dirname, '..', 'public'));

  //Enable CORS
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  //Enable cookie
  app.use(cookieParser());

  //Enable helmet
  app.use(helmet());

  //Enable versioning
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: ['1', '2'],
  });

  await app.listen(configService.get<string>('PORT'));
}
bootstrap();
