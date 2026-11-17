import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PagamentosController } from './pagamentos.controller.js';
import { PagamentosService } from './pagamentos.service.js';
import { Pedido } from '../pedidos/pedido.entity.js';
import { ItemPedido } from '../itempedido/itempedido.entity.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Pedido, ItemPedido]), AuthModule],
  controllers: [PagamentosController],
  providers: [PagamentosService],
})
export class PagamentosModule {}
