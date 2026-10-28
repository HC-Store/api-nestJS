
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Pedido } from '../pedidos/pedido.entity.js';
import { Produto } from '../produtos/produto.entity.js';

@Entity('itempedido')
export class ItemPedido {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  pedidoId: number;

  @Column()
  produtoId: number;

  @Column()
  quantidade: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  preco: number;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  @ManyToOne(() => Pedido)
  @JoinColumn({ name: 'pedidoId' })
  pedido: Pedido;

  @ManyToOne(() => Produto)
  @JoinColumn({ name: 'produtoId' })
  produto: Produto;
}
