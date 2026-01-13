import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from './entity/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: 'super-secret-key', // ضع مفتاح قوي أو من .env
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}