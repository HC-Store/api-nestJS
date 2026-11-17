import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CuponsService } from './cupons.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { AdminGuard } from '../auth/admin.guard.js';

@Controller('cupons')
@UseGuards(JwtAuthGuard)
export class CuponsController {
  constructor(private readonly cuponsService: CuponsService) {}

  // Valida o cupom para o usuário logado
  @Post('validar')
  validar(
    @Req() req: { user: { id: number } },
    @Body() dados: { codigo: string; subtotal: number },
  ) {
    return this.cuponsService.validar(req.user.id, dados.codigo, dados.subtotal);
  }

  @Get()
  @UseGuards(AdminGuard)
  findAll() {
    return this.cuponsService.findAll();
  }

  @Post()
  @UseGuards(AdminGuard)
  create(
    @Body()
    dados: {
      codigo: string;
      tipo: string;
      valor: number;
      ativo?: boolean;
      usoMaximo?: number | null;
    },
  ) {
    return this.cuponsService.create(dados);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.cuponsService.remove(id);
  }
}
