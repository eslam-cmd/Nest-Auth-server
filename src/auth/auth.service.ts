import {
  Injectable,
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from './entity/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  /** تسجيل مستخدم جديد */
  async register(email: string, password: string, username?: string) {
    const existingUser = await this.userRepo.findOne({ where: { email } });
    if (existingUser) {
      throw new HttpException('البريد الإلكتروني موجود مسبقًا', HttpStatus.BAD_REQUEST);
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = this.userRepo.create({ email, password: hashed, username });
    const savedUser = await this.userRepo.save(user);

    const { password: _, refreshToken, ...safeUser } = savedUser;
    return safeUser;
  }

  /** تسجيل الدخول */
  async login(email: string, password: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('بيانات الدخول غير صحيحة');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('بيانات الدخول غير صحيحة');
    }

    const payload = { sub: user.id, email: user.email };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    // خزّن refresh token مشفّر في قاعدة البيانات
    user.refreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userRepo.save(user);

    const { password: _, refreshToken: __, ...safeUser } = user;
    return { accessToken, refreshToken, user: safeUser };
  }

  /** تجديد التوكن */
  async refresh(userId: string, refreshToken: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('غير مصرح بالدخول');
    }

    const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isMatch) {
      throw new UnauthorizedException('التوكن غير صالح');
    }

    const payload = { sub: user.id, email: user.email };
    const newAccessToken = this.jwtService.sign(payload, { expiresIn: '15m' });

    return { accessToken: newAccessToken };
  }

  /** جلب الملف الشخصي */
  async getProfile(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new HttpException('المستخدم غير موجود', HttpStatus.NOT_FOUND);
    }

    const { password: _, refreshToken, ...safeUser } = user;
    return safeUser;
  }

  /** تحديث الملف الشخصي */
  async updateProfile(userId: string, username: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new HttpException('المستخدم غير موجود', HttpStatus.NOT_FOUND);
    }

    user.username = username;
    const updatedUser = await this.userRepo.save(user);

    const { password: _, refreshToken, ...safeUser } = updatedUser;
    return safeUser;
  }

  /** تسجيل الخروج */
  async logout(userId: string) {
    await this.userRepo.update(userId, { refreshToken: null });
    return { message: 'تم تسجيل الخروج بنجاح' };
  }

  /** حذف الحساب */
  async deleteAccount(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new HttpException('المستخدم غير موجود', HttpStatus.NOT_FOUND);
    }

    await this.userRepo.delete({ id: userId });
    return { message: 'تم حذف الحساب بنجاح' };
  }

  async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    await this.userRepo.update(
      { id: userId },
      { refreshToken: refreshToken },
    );
  }
}