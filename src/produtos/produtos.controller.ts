import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CreateProdutoDto } from './dto/create-produto.dto.js';
import { ProdutosService } from './produtos.service.js';
import { UpdateProdutoDto } from './dto/update-produto.dto.js';

@Controller('produtos')
export class ProdutosController {
  constructor(private readonly produtosService: ProdutosService) {}

  @Get()
  findAll() {
    return this.produtosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.produtosService.findOne(Number(id));
  }

  @Post()
  create(@Body() createProdutoDto: CreateProdutoDto) {
    return this.produtosService.create(createProdutoDto);
  }

  @Put(':id')
update(
  @Param('id') id: string,
  @Body() updateProdutoDto: UpdateProdutoDto,
) {
  return this.produtosService.update(Number(id), updateProdutoDto);
}


@Delete(':id')
remove(@Param('id') id: string) {
  return this.produtosService.remove(Number(id));
}

}