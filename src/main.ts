import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.enableCors({
    origin: [
      'https://nest-auth-client.vercel.app',
      'http://localhost:3000', // منفذ تطبيق الفرونت إند Next.js
    ],
    credentials: true, 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With',// للسماح بتبادل الكوكيز
  });

  // السيرفر يعمل على المنفذ 3001
  await app.listen(3001);
}
bootstrap();
