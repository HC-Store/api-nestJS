import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('configsite')
export class ConfigSite {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  chave: string;

  @Column({ type: 'json' })
  valor: Record<string, unknown>;

  @Column({ type: 'datetime' })
  createdAt: Date;

  @Column({ type: 'datetime' })
  updatedAt: Date;
}
