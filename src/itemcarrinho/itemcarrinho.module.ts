
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ItemCarrinho } from './itemcarrinho.entity.js';
import { ItemCarrinhoController } from './itemcarrinho.controller.js';
import { ItemCarrinhoService } from './itemcarrinho.service.js';

import { Carrinho } from '../carrinho/carrinho.entity.js';
import { Produto } from '../produtos/produto.entity.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ItemCarrinho,
      Carrinho,
      Produto,
    ]),
    AuthModule,
  ],
  controllers: [ItemCarrinhoController],
  providers: [ItemCarrinhoService],
})
export class ItemCarrinhoModule {}
