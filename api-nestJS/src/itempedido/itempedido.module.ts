
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ItemPedido } from './itempedido.entity.js';
import { ItemPedidoController } from './itempedido.controller.js';
import { ItemPedidoService } from './itempedido.service.js';
import { Pedido } from '../pedidos/pedido.entity.js';
import { Produto } from '../produtos/produto.entity.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ItemPedido,
      Pedido,
      Produto,
    ]),
    AuthModule,
  ],
  controllers: [ItemPedidoController],
  providers: [ItemPedidoService],
})
export class ItemPedidoModule {}
