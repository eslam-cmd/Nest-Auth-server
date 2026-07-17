import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser'; // 👈 التعديل هنا لضمان عمل الحزمة بأمان في TS

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.enableCors({
    origin: [
      'https://nest-auth-client.vercel.app',
      'http://localhost:3000', // منفذ تطبيق الفرونت إند Next.js
    ],
    credentials: true, // للسماح بتبادل الكوكيز
  });

  // السيرفر يعمل على المنفذ 3001
  await app.listen(3001);
}
bootstrap();
