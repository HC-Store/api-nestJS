import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UsuarioRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

@Entity('usuario')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome: string;

  @Column()
  sobrenome: string;

  @Column({ unique: true })
  email: string;

  @Column()
  senha: string;

  @Column({ unique: true })
  cpf: string;

  @Column()
  telefone: string;

  @Column()
  sexo: string;

  @Column({ type: 'datetime' })
  dataNascimento: Date;

  @Column({ default: true })
  ativo: boolean;

  @Column({
    type: 'enum',
    enum: UsuarioRole,
    default: UsuarioRole.USER,
  })
  role: UsuarioRole;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date;
}
