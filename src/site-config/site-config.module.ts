import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigSite } from './config-site.entity.js';
import { SiteConfigController } from './site-config.controller.js';
import { SiteConfigService } from './site-config.service.js';
import { Usuario } from '../usuarios/usuario.entity.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([ConfigSite, Usuario]), AuthModule],
  controllers: [SiteConfigController],
  providers: [SiteConfigService],
})
export class SiteConfigModule {}
