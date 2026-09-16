import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProdutoImagem } from './produto-imagem.entity.js';
import { ProdutoImagemService } from './produto-imagem.service.js';
import { ProdutoImagemController } from './produto-imagem.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([ProdutoImagem])],
  providers: [ProdutoImagemService],
  controllers: [ProdutoImagemController],
})
export class ProdutoImagemModule {} 