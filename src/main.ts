import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser'; // لاحظ بدون *

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.enableCors({
    origin: 'http://localhost:3000',
    'https://github.com/eslam-cmd/Nest-Auth-client': true,
    credentials: true,
  });

  await app.listen(3001);
}
bootstrap();