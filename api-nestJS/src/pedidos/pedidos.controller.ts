
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { PedidosService } from './pedidos.service.js';
import { PedidoStatus } from './pedido.entity.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller('pedidos')
@UseGuards(JwtAuthGuard)
export class PedidosController {
  constructor(
    private readonly pedidosService: PedidosService,
  ) {}

  @Get()
  findAll() {
    return this.pedidosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.pedidosService.findOne(id);
  }

  @Post()
  create(
    @Body()
    dados: {
      usuarioId: number;
      enderecoId: number;
      total: number;
      frete?: number | null;
      desconto?: number | null;
      totalFinal?: number | null;
      tipoEntrega?: string | null;
      cupomCodigo?: string | null;
      status?: PedidoStatus;
    },
  ) {
    return this.pedidosService.create(dados);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    dados: {
      status?: PedidoStatus;
      total?: number;
      frete?: number | null;
      desconto?: number | null;
      totalFinal?: number | null;
      tipoEntrega?: string | null;
      cupomCodigo?: string | null;
    },
  ) {
    return this.pedidosService.update(id, dados);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.pedidosService.remove(id);
  }
}
