import { Body, Controller, Get, Param, Post, Put,  Delete } from '@nestjs/common';
import { EnderecosService } from './enderecos.service.js';
import { CreateEnderecoDto } from './dto/create-endereco.dto.js';
import { UpdateEnderecoDto } from './dto/update-endereco.dto.js';

@Controller('enderecos')
export class EnderecosController {
  constructor(private readonly enderecosService: EnderecosService) {}

  @Get()
  findAll() {
    return this.enderecosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.enderecosService.findOne(Number(id));
  }

  @Post()
  create(@Body() createEnderecoDto: CreateEnderecoDto) {
    return this.enderecosService.create(createEnderecoDto);
  }

  @Put(':id')
  update(
  @Param('id') id: string,
  @Body() updateEnderecoDto: UpdateEnderecoDto,
) {
  return this.enderecosService.update(Number(id), updateEnderecoDto);
}

@Delete(':id')
remove(@Param('id') id: string) {
  return this.enderecosService.remove(Number(id));
}
}