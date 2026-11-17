
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Pedido } from './pedido.entity.js';
import { PedidosController } from './pedidos.controller.js';
import { PedidosService } from './pedidos.service.js';

import { Usuario } from '../usuarios/usuario.entity.js';
import { Endereco } from '../enderecos/endereco.entity.js';
import { Produto } from '../produtos/produto.entity.js';
import { ItemPedido } from '../itempedido/itempedido.entity.js';
import { Cupom } from '../cupons/cupom.entity.js';
import { CupomUso } from '../cupons/cupom-uso.entity.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Pedido,
      Usuario,
      Endereco,
      Produto,
      ItemPedido,
      Cupom,
      CupomUso,
    ]),
    AuthModule,
  ],
  controllers: [PedidosController],
  providers: [PedidosService],
})
export class PedidosModule {}
