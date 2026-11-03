import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ProdutoImagemService } from './produto-imagem.service.js';
import { CreateProdutoImagemDto } from './dto/create-produto-imagem.dto.js';

@Controller('produto-imagem')
export class ProdutoImagemController {
  constructor(
    private readonly produtoImagemService: ProdutoImagemService,
  ) {}

  @Get()
  findAll() {
    return this.produtoImagemService.findAll();
  }

  @Get('produto/:produtoId')
  findByProdutoId(@Param('produtoId') produtoId: string) {
    return this.produtoImagemService.findByProdutoId(Number(produtoId));
  }

  @Post()
  create(@Body() createProdutoImagemDto: CreateProdutoImagemDto) {
    return this.produtoImagemService.create(createProdutoImagemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.produtoImagemService.remove(Number(id));
  }

}