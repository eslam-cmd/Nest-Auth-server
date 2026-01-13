import { IsNotEmpty } from 'class-validator';

export class UpdateProfileDto {
  @IsNotEmpty({ message: 'اسم المستخدم مطلوب' })
  username: string;
}