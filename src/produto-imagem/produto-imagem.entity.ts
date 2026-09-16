import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Produto } from '../produtos/produto.entity.js';

@Entity('produtoImagem')
export class ProdutoImagem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @Column()
  produtoId: number;

  @ManyToOne(() => Produto, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'produtoId' })
  produto: Produto;
}