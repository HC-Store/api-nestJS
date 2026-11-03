
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

import { ItemCarrinhoService } from './itemcarrinho.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller('itemcarrinho')
@UseGuards(JwtAuthGuard)
export class ItemCarrinhoController {
  constructor(
    private readonly itemCarrinhoService: ItemCarrinhoService,
  ) {}

  @Get()
  findAll() {
    return this.itemCarrinhoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.itemCarrinhoService.findOne(id);
  }

  @Post()
  create(
    @Body()
    dados: {
      carrinhoId: number;
      produtoId: number;
      quantidade: number;
    },
  ) {
    return this.itemCarrinhoService.create(dados);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    dados: {
      quantidade?: number;
    },
  ) {
    return this.itemCarrinhoService.update(id, dados);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.itemCarrinhoService.remove(id);
  }
}
