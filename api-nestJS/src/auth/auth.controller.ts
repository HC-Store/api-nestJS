
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dados: { email: string; senha: string },
  ) {
    if (
      !dados.email ||
      typeof dados.email !== 'string' ||
      !dados.senha ||
      typeof dados.senha !== 'string'
    ) {
      throw new BadRequestException(
        'Informe um e-mail e uma senha válidos',
      );
    }

    return this.authService.login(
      dados.email.trim(),
      dados.senha,
    );
  }
}
