import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  Validate,
} from 'class-validator';
import { IsPasswordMatchingConstraint } from './create-employee-account.dto';

export class UpdateAccountEmployeeDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(256)
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  avatar: string;

  @IsOptional()
  @IsBoolean()
  changePassword: boolean;

  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  @Validate(IsPasswordMatchingConstraint, ['password'])
  confirmPassword: string;
}
