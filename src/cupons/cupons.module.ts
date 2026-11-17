import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cupom } from './cupom.entity.js';
import { CupomUso } from './cupom-uso.entity.js';
import { CuponsController } from './cupons.controller.js';
import { CuponsService } from './cupons.service.js';
import { Usuario } from '../usuarios/usuario.entity.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Cupom, CupomUso, Usuario]), AuthModule],
  controllers: [CuponsController],
  providers: [CuponsService],
})
export class CuponsModule {}
