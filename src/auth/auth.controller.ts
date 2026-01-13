import {
  Controller,
  Post,
  Body,
  Res,
  Get,
  Put,
  Req,
  Delete,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/updateProfile.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  // إعدادات الكوكيز حسب البيئة
  private cookieOptions(maxAge: number) {
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' ? true : false,
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge,
    };
  }

  // تسجيل مستخدم جديد
  @Post('register')
  async register(@Body() dto: RegisterDto, @Res() res: Response) {
    try {
      const user = await this.authService.register(
        dto.email,
        dto.password,
        dto.username,
      );

      // إنشاء التوكنات
      const accessToken = this.jwtService.sign(
        { sub: user.id, email: user.email },
        { expiresIn: '15m' },
      );
      const refreshToken = this.jwtService.sign(
        { sub: user.id, email: user.email },
        { expiresIn: '7d' },
      );

      // تخزين refresh token في قاعدة البيانات
      await this.authService.login(user.email, dto.password);

      // كتابة الكوكيز
      res.cookie('access_token', accessToken, this.cookieOptions(15 * 60 * 1000));
      res.cookie('refresh_token', refreshToken, this.cookieOptions(7 * 24 * 60 * 60 * 1000));

      return res.json({ success: true, message: 'تم التسجيل بنجاح', user });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  // تسجيل الدخول
  @Post('login')
  async login(@Body() dto: LoginDto, @Res() res: Response) {
    const { accessToken, refreshToken, user } = await this.authService.login(
      dto.email,
      dto.password,
    );

    res.cookie('access_token', accessToken, this.cookieOptions(15 * 60 * 1000));
    res.cookie('refresh_token', refreshToken, this.cookieOptions(7 * 24 * 60 * 60 * 1000));

    return res.json({ success: true, message: 'تم تسجيل الدخول بنجاح', user });
  }

  // تجديد التوكن باستخدام refresh_token
  @Post('refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    const token = req.cookies['refresh_token'];
    if (!token) {
      throw new HttpException('غير مصرح بالدخول', HttpStatus.UNAUTHORIZED);
    }

    try {
      const payload = this.jwtService.verify(token);
      const { accessToken } = await this.authService.refresh(payload.sub, token);

      res.cookie('access_token', accessToken, this.cookieOptions(15 * 60 * 1000));

      return res.json({ success: true, message: 'تم تجديد التوكن بنجاح' });
    } catch {
      throw new HttpException('التوكن غير صالح', HttpStatus.UNAUTHORIZED);
    }
  }

  // استخراج userId من الكوكيز
  private getUserIdFromCookie(req: Request): string {
    const token = req.cookies['access_token'];
    if (!token) {
      throw new HttpException('غير مصرح بالدخول', HttpStatus.UNAUTHORIZED);
    }
    try {
      const payload = this.jwtService.verify(token);
      return payload.sub as string;
    } catch {
      throw new HttpException('التوكن غير صالح', HttpStatus.UNAUTHORIZED);
    }
  }

  // جلب الملف الشخصي
  @Get('me')
  async getProfile(@Req() req: Request) {
    const userId = this.getUserIdFromCookie(req);
    const user = await this.authService.getProfile(userId);
    return { success: true, user };
  }

  // تحديث اسم المستخدم
  @Put('update')
  async updateProfile(@Req() req: Request, @Body() dto: UpdateProfileDto) {
    const userId = this.getUserIdFromCookie(req);
    const user = await this.authService.updateProfile(userId, dto.username);
    return { success: true, message: 'تم تحديث الملف الشخصي', user };
  }

  // تسجيل الخروج
  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    const userId = this.getUserIdFromCookie(req);
    await this.authService.logout(userId);

    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return res.json({ success: true, message: 'تم تسجيل الخروج بنجاح' });
  }

  // حذف الحساب
  @Delete('delete')
  async deleteAccount(@Req() req: Request, @Res() res: Response) {
    const userId = this.getUserIdFromCookie(req);
    const result = await this.authService.deleteAccount(userId);

    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return res.json({ success: true, ...result });
  }
}