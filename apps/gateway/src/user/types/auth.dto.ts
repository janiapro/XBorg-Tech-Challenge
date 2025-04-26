import { IsNotEmpty, IsOptional, IsString, IsEmail } from 'class-validator';

export class AuthResponseDTO {
  @IsString()
  @IsNotEmpty()
  token!: string; // Add the `!` operator
}

export class LoginDTO {
  @IsString()
  @IsNotEmpty()
  message!: string; // Add the `!` operator

  @IsString()
  @IsNotEmpty()
  signature!: string; // Add the `!` operator
}

export class SignUpDTO {
  @IsString()
  @IsNotEmpty()
  message!: string;

  @IsString()
  @IsNotEmpty()
  signature!: string;

  @IsString()
  @IsNotEmpty()
  userName!: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;
}
