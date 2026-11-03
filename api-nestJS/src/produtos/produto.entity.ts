import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Categoria } from '../categorias/categoria.entity.js';

@Entity('produto')
export class Produto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome: string;

  @Column()
  descricao: string;

  @Column('decimal', { precision: 10, scale: 2 })
  preco: number;

  @Column()
  estoque: number;

  @Column({ nullable: true })
  marca: string;

  @Column({ nullable: true })
  tamanho: string;

  @Column('text', { nullable: true })
  composicaoMaterial: string;

  @Column('text', { nullable: true })
  instrucaoLavagem: string;

  @Column('text', { nullable: true })
  enviosDevolucoes: string;

  @Column('text', { nullable: true })
  quantidadePorTamanho: string;

 @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  @Column()
  categoriaId: number;

  @ManyToOne(() => Categoria)
  @JoinColumn({ name: 'categoriaId' })
  categoria: Categoria;

  @Column({ default: true })
  ativo: boolean;
}