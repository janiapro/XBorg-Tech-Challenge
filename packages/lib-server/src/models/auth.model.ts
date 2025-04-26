import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export const SignUpCall = 'SignUpCall'; // Add this line

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

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsNotEmpty() // Address is mandatory
  address!: string;
}
