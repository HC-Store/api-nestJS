import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Produto } from './produto.entity.js';
import { ProdutosService } from './produtos.service.js';
import { ProdutosController } from './produtos.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Produto])],
  providers: [ProdutosService],
  controllers: [ProdutosController],
})
export class ProdutosModule {}