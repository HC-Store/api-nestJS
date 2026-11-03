
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Usuario } from '../usuarios/usuario.entity.js';
import { Endereco } from '../enderecos/endereco.entity.js';

export enum PedidoStatus {
  PENDENTE = 'PENDENTE',
  PAGO = 'PAGO',
  ENVIADO = 'ENVIADO',
  ENTREGUE = 'ENTREGUE',
  CANCELADO = 'CANCELADO',
}


@Entity('pedido')
export class Pedido {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  usuarioId: number;

  @Column()
  enderecoId: number;

  @Column({
    type: 'enum',
    enum: PedidoStatus,
    default: PedidoStatus.PENDENTE,
  })
  status: PedidoStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  frete: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  desconto: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalFinal: number | null;

  @Column({ type: 'varchar', nullable: true })
  tipoEntrega: string | null;

  @Column({ type: 'varchar', nullable: true })
  cupomCodigo: string | null;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;

  @ManyToOne(() => Endereco)
  @JoinColumn({ name: 'enderecoId' })
  endereco: Endereco;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuarioId' })
  usuario: Usuario;
}
