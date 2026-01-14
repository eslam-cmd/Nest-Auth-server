import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser'; // لاحظ بدون *

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.enableCors({
    origin: 'https://nest-auth-client.vercel.app',
    credentials: true,
  });

  await app.listen(3001);
}
bootstrap();