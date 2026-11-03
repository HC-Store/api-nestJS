
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Carrinho } from './carrinho.entity.js';
import { CarrinhoController } from './carrinho.controller.js';
import { CarrinhoService } from './carrinho.service.js';
import { Usuario } from '../usuarios/usuario.entity.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Carrinho, Usuario]),
    AuthModule,
  ],
  controllers: [CarrinhoController],
  providers: [CarrinhoService],
})
export class CarrinhoModule {}
