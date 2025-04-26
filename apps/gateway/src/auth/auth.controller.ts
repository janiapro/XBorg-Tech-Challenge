import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';

import { UserClientAPI, UserDTO } from 'lib-server';

import { JwtGuard } from '../auth/guards/jwt.guard';
import { JwtService } from '../auth/jwt.service';
import { SiweService } from '../siwe/siwe.service';
import { AuthResponseDTO, LoginDTO, SignUpDTO } from '../user/types/auth.dto';

@Controller('auth') // Update the route to match the module
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly userAPI: UserClientAPI,
    private readonly siweService: SiweService,
  ) {}

  @Get('/user')
  @UseGuards(JwtGuard)
  async getUser(@Request() req): Promise<UserDTO> {
    this.logger.log(`Get user: ${req.user.id}`);
    return this.userAPI.getUser({ id: req.user.id });
  }

  @Post('/signup')
  async signup(
    @Body() { message, signature, ...body }: SignUpDTO,
  ): Promise<AuthResponseDTO> {
    this.logger.log(`Signup user requested`);
    const verified = await this.siweService.verifyMessage(message, signature);
    const user = await this.userAPI.signUp({
      ...body,
      message, // Include the message
      signature, // Include the signature
      address: verified.address, // Include the verified address
    });
    return this.jwtService.buildAuthRes(user);
  }

  @Post('/login')
  async login(
    @Body() { message, signature }: LoginDTO,
  ): Promise<AuthResponseDTO> {
    this.logger.log(`Login user request`);
    try {
      const verified = await this.siweService.verifyMessage(message, signature);
      const user = await this.userAPI.getUser({ address: verified.address });
      return this.jwtService.buildAuthRes(user);
    } catch {
      throw new UnauthorizedException();
    }
  }
}
