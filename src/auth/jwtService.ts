import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
// استورد هنا الـ UserRepository أو أي خدمة تحقق من المستخدم

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    // private readonly userRepo: UserRepository مثلا
  ) {}

  async login(email: string, password: string) {
    // تحقق من المستخدم من قاعدة البيانات
    const user = await this.findUserByEmail(email); // لازم تعمل دالة تحقق
    if (!user) {
      throw new UnauthorizedException('المستخدم غير موجود');
    }

    // تحقق من كلمة المرور (مثلاً باستخدام bcrypt)
    const isPasswordValid = await this.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('كلمة المرور غير صحيحة');
    }

    // إنشاء payload
    const payload = { sub: user.id, email: user.email };

    // إنشاء التوكنات
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return { accessToken, refreshToken, user };
  }

  async verifyToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('التوكن غير صالح');
    }
  }

  // مثال لدوال مساعدة
  private async findUserByEmail(email: string) {
    // هنا تستدعي قاعدة البيانات
    return { id: '123', email, password: 'hashedPassword' }; // مؤقتًا
  }

  private async verifyPassword(password: string, hashedPassword: string) {
    // هنا تستخدم bcrypt.compare
    return password === hashedPassword; // مؤقتًا
  }
}