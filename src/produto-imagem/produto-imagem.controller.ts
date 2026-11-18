
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import { ProdutoImagemService } from './produto-imagem.service.js';
import { CreateProdutoImagemDto } from './dto/create-produto-imagem.dto.js';
import type { UploadedImage } from './dto/interfaces/uploaded-image.interface.js';

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
  findByProdutoId(
    @Param('produtoId', ParseIntPipe) produtoId: number,
  ) {
    return this.produtoImagemService.findByProdutoId(produtoId);
  }

  @Post()
  create(@Body() createProdutoImagemDto: CreateProdutoImagemDto) {
    return this.produtoImagemService.create(createProdutoImagemDto);
  }

  @Post('upload/:produtoId')
  @UseInterceptors(FileInterceptor('imagem'))
  uploadImage(
    @UploadedFile() file: UploadedImage,
    @Param('produtoId', ParseIntPipe) produtoId: number,
  ) {
    if (!file) {
      throw new BadRequestException('Envie uma imagem.');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('O arquivo precisa ser uma imagem.');
    }

    return this.produtoImagemService.uploadImage(file, produtoId);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.produtoImagemService.remove(id);
  }
}
