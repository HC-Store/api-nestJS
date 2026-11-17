import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

const decimal = {
  to: (value?: number) => value,
  from: (value: string | null) => (value === null ? null : Number(value)),
};

@Entity('cupom')
export class Cupom {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  codigo: string;

  // PERCENTUAL ou FIXO
  @Column()
  tipo: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, transformer: decimal })
  valor: number;

  @Column({ default: true })
  ativo: boolean;

  @Column({ type: 'int', nullable: true })
  usoMaximo: number | null;

  @Column({ type: 'int', default: 0 })
  usado: number;

  @Column({ type: 'datetime' })
  createdAt: Date;

  @Column({ type: 'datetime' })
  updatedAt: Date;
}
