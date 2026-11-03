
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import { CategoriasService } from './categorias.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller('categorias')
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  // Consulta pública
  @Get()
  findAll() {
    return this.categoriasService.findAll();
  }

  // Consulta pública
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriasService.findOne(Number(id));
  }

  // Cadastro exige token JWT
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body('nome') nome: string) {
    return this.categoriasService.create(nome);
  }
}
