import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CategoriasService } from './categorias.service.js';

@Controller('categorias')
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  @Get()
  findAll() {
    return this.categoriasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriasService.findOne(Number(id));
  }

  @Post()
  create(@Body('nome') nome: string) {
    return this.categoriasService.create(nome);
  }

  
}
