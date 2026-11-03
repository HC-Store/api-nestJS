
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Carrinho } from '../carrinho/carrinho.entity.js';
import { Produto } from '../produtos/produto.entity.js';

@Entity('itemcarrinho')
export class ItemCarrinho {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  carrinhoId: number;

  @Column()
  produtoId: number;

  @Column()
  quantidade: number;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  @ManyToOne(() => Carrinho)
  @JoinColumn({ name: 'carrinhoId' })
  carrinho: Carrinho;

  @ManyToOne(() => Produto)
  @JoinColumn({ name: 'produtoId' })
  produto: Produto;
}
