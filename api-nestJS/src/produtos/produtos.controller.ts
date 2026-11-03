
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Patch,
  UseGuards,
} from '@nestjs/common';

import { CreateProdutoDto } from './dto/create-produto.dto.js';
import { UpdateProdutoDto } from './dto/update-produto.dto.js';
import { ProdutosService } from './produtos.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller('produtos')
export class ProdutosController {
  constructor(private readonly produtosService: ProdutosService) {}

  // Consulta pública: listar produtos
  @Get()
  findAll() {
    return this.produtosService.findAll();
  }

  // Consulta pública: buscar produto por ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.produtosService.findOne(Number(id));
  }

  // Exige token JWT
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createProdutoDto: CreateProdutoDto) {
    return this.produtosService.create(createProdutoDto);
  }

  // Exige token JWT
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateProdutoDto: UpdateProdutoDto,
  ) {
    return this.produtosService.update(Number(id), updateProdutoDto);
  }

  // Exige token JWT
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.produtosService.remove(Number(id));
  }

  // Exige token JWT
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  alterarStatus(
    @Param('id') id: string,
    @Body('ativo') ativo: boolean,
  ) {
    return this.produtosService.alterarStatus(Number(id), ativo);
  }
}
