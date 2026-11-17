import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('cupomUso')
@Unique(['cupomId', 'usuarioId'])
export class CupomUso {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  cupomId: number;

  @Column()
  usuarioId: number;

  @Column({ type: 'datetime' })
  createdAt: Date;
}
