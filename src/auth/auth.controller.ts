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
import type { Response, Request } from 'express';
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

  // إعدادات الكوكيز المتوافقة مع اختلاف المنافذ محلياً وفي الإنتاج
  private cookieOptions(maxAge: number) {
    const isProd = process.env.NODE_ENV === 'production';

    return {
      httpOnly: true,
      // يجب أن تكون true في المتصفحات الحديثة عند استخدام sameSite: 'none' محلياً أو في الإنتاج
      secure: true,
      // 'none' تسمح بنقل الكوكي بين localhost:3000 و localhost:3001
      sameSite: isProd ? ('strict' as const) : ('none' as const),
      maxAge,
      path: '/', // متاح في كامل مسارات الموقع
    };
  }

  // تسجيل مستخدم جديد
  @Post('register')
  async register(@Body() dto: RegisterDto, @Res() res: Response) {
    try {
      // 1. سجل المستخدم بدون توكنات
      const user = await this.authService.register(
        dto.email,
        dto.password,
        dto.username,
      );

      // 2. أنشئ التوكنات بعد التسجيل
      const payload = { sub: user.id, email: user.email };

      const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
      const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

      // 3. خزن refresh token في قاعدة البيانات
      await this.authService.storeRefreshToken(user.id, refreshToken);

      // 4. ضع التوكنات في الكوكيز
      res.cookie(
        'access_token',
        accessToken,
        this.cookieOptions(15 * 60 * 1000),
      );
      res.cookie(
        'refresh_token',
        refreshToken,
        this.cookieOptions(7 * 24 * 60 * 60 * 1000),
      );

      return res.json({
        success: true,
        message: 'تم التسجيل بنجاح',
        user,
      });
    } catch (error) {
      throw new HttpException(
        error.message || 'حدث خطأ أثناء التسجيل',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // تسجيل الدخول
  @Post('login')
  async login(@Body() dto: LoginDto, @Res() res: Response) {
    try {
      const { accessToken, refreshToken, user } = await this.authService.login(
        dto.email,
        dto.password,
      );

      res.cookie(
        'access_token',
        accessToken,
        this.cookieOptions(15 * 60 * 1000),
      );
      res.cookie(
        'refresh_token',
        refreshToken,
        this.cookieOptions(7 * 24 * 60 * 60 * 1000),
      );

      return res.json({
        success: true,
        message: 'تم تسجيل الدخول بنجاح',
        user,
      });
    } catch (error) {
      throw new HttpException(
        error.message || 'بيانات الدخول غير صحيحة',
        HttpStatus.UNAUTHORIZED,
      );
    }
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
      const { accessToken } = await this.authService.refresh(
        payload.sub,
        token,
      );

      res.cookie(
        'access_token',
        accessToken,
        this.cookieOptions(15 * 60 * 1000),
      );

      return res.json({
        success: true,
        message: 'تم تجديد التوكن بنجاح',
      });
    } catch (error) {
      res.clearCookie('access_token');
      res.clearCookie('refresh_token');
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
    try {
      const userId = this.getUserIdFromCookie(req);
      const user = await this.authService.getProfile(userId);
      return { success: true, user };
    } catch (error) {
      throw new HttpException(
        error.message || 'حدث خطأ',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  // تحديث اسم المستخدم
  @Put('update')
  async updateProfile(@Req() req: Request, @Body() dto: UpdateProfileDto) {
    try {
      const userId = this.getUserIdFromCookie(req);
      const user = await this.authService.updateProfile(userId, dto.username);
      return {
        success: true,
        message: 'تم تحديث الملف الشخصي',
        user,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'حدث خطأ أثناء التحديث',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // تسجيل الخروج
  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    try {
      const userId = this.getUserIdFromCookie(req);
      await this.authService.logout(userId);

      res.clearCookie('access_token');
      res.clearCookie('refresh_token');

      return res.json({
        success: true,
        message: 'تم تسجيل الخروج بنجاح',
      });
    } catch (error) {
      throw new HttpException(
        error.message || 'حدث خطأ أثناء تسجيل الخروج',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // حذف الحساب
  @Delete('delete')
  async deleteAccount(@Req() req: Request, @Res() res: Response) {
    try {
      const userId = this.getUserIdFromCookie(req);
      await this.authService.deleteAccount(userId);

      res.clearCookie('access_token');
      res.clearCookie('refresh_token');

      return res.json({
        success: true,
        message: 'تم حذف الحساب بنجاح',
      });
    } catch (error) {
      throw new HttpException(
        error.message || 'حدث خطأ أثناء حذف الحساب',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
