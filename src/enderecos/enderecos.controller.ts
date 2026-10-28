
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';

import { EnderecosService } from './enderecos.service.js';
import { CreateEnderecoDto } from './dto/create-endereco.dto.js';
import { UpdateEnderecoDto } from './dto/update-endereco.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller('enderecos')
export class EnderecosController {
  constructor(private readonly enderecosService: EnderecosService) {}

  // Consulta pública
  @Get()
  findAll() {
    return this.enderecosService.findAll();
  }

  // Consulta pública
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.enderecosService.findOne(Number(id));
  }

  // Exige token JWT
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createEnderecoDto: CreateEnderecoDto) {
    return this.enderecosService.create(createEnderecoDto);
  }

  // Exige token JWT
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateEnderecoDto: UpdateEnderecoDto,
  ) {
    return this.enderecosService.update(Number(id), updateEnderecoDto);
  }

  // Exige token JWT
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.enderecosService.remove(Number(id));
  }
}
