import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get(ConfigService);

  //config static file
  app.useStaticAssets(join(__dirname, '..', 'public'));

  await app.listen(configService.get<string>('PORT'));
}
bootstrap();
