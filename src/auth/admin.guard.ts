import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario, UsuarioRole } from '../usuarios/usuario.entity.js';

// Use depois do JwtAuthGuard: @UseGuards(JwtAuthGuard, AdminGuard)
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<{ user?: { id: number } }>();

    const usuario = req.user?.id
      ? await this.usuarioRepository.findOne({ where: { id: req.user.id } })
      : null;

    if (!usuario || usuario.role !== UsuarioRole.ADMIN) {
      throw new ForbiddenException('Acesso restrito a administradores');
    }

    return true;
  }
}
