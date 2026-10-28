
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Endereco } from './endereco.entity.js';
import { EnderecosController } from './enderecos.controller.js';
import { EnderecosService } from './enderecos.service.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Endereco]),
    AuthModule,
  ],
  controllers: [EnderecosController],
  providers: [EnderecosService],
})
export class EnderecosModule {}
