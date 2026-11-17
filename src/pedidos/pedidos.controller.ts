
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
  Req,
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

  // Finaliza a compra: o app envia só os itens; preço, estoque e cupom
  // são validados no servidor
  @Post('checkout')
  checkout(
    @Req() req: { user: { id: number } },
    @Body()
    dados: {
      enderecoId: number;
      items: { produtoId: number; quantidade: number }[];
      tipoEntrega?: string | null;
      cupomCodigo?: string | null;
    },
  ) {
    return this.pedidosService.checkout(req.user.id, dados);
  }

  // Pedidos do usuário logado
  @Get('meus')
  findMine(@Req() req: { user: { id: number } }) {
    return this.pedidosService.findByUsuario(req.user.id);
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
