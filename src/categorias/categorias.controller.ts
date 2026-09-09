import { Body, Controller, Get, Post } from '@nestjs/common';
import { CategoriasService } from './categorias.service.js';

@Controller('categorias')
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  @Get()
  findAll() {
    return this.categoriasService.findAll();
  }

  @Post()
  create(@Body('nome') nome: string) {
    return this.categoriasService.create(nome);
  }

  
}
