import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isPasswordMatching', async: false })
export class IsPasswordMatchingConstraint
  implements ValidatorConstraintInterface
{
  validate(confirmPassword: any, args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    const relatedValue = (args.object as any)[relatedPropertyName];
    return confirmPassword === relatedValue;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Password and confirmation password do not match';
  }
}

export class CreateEmployeeAccountDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(256)
  name: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  address: string;

  @IsNotEmpty()
  @Matches(/(((\+|)84)|0)(3|5|7|8|9)+([0-9]{8})\b/)
  phoneNumber: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  avatar: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  @Validate(IsPasswordMatchingConstraint, ['password'])
  confirmPassword: string;
}
