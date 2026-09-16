import { Controller, Get, Param } from '@nestjs/common';
import { ProdutoImagemService } from './produto-imagem.service.js';

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
}