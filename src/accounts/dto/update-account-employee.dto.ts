import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { IsPasswordMatchingConstraint } from './create-employee-account.dto';
import { Role } from 'src/constants/enum';


@ValidatorConstraint({ name: 'isChangePasswordValid', async: false })
export class IsChangePasswordValidConstraint
  implements ValidatorConstraintInterface
{
  validate(changePassword: any, args: ValidationArguments) {
    const { password, confirmPassword } = args.object as any;
    if (changePassword && (!password || !confirmPassword)) {
      return false;
    }
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Hãy nhập mật khẩu mới và xác nhận mật khẩu mới';
  }
}

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
  @Validate(IsChangePasswordValidConstraint)
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

  @IsOptional()
  @IsEnum(Role)
  role: Role = Role.Employee;
}
