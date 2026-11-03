
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

import { ItemPedidoService } from './itempedido.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller('itempedido')
@UseGuards(JwtAuthGuard)
export class ItemPedidoController {
  constructor(
    private readonly itemPedidoService: ItemPedidoService,
  ) {}

  @Get()
  findAll() {
    return this.itemPedidoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.itemPedidoService.findOne(id);
  }

  @Post()
  create(
    @Body()
    dados: {
      pedidoId: number;
      produtoId: number;
      quantidade: number;
      preco: number;
    },
  ) {
    return this.itemPedidoService.create(dados);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    dados: {
      quantidade?: number;
      preco?: number;
    },
  ) {
    return this.itemPedidoService.update(id, dados);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.itemPedidoService.remove(id);
  }
}
