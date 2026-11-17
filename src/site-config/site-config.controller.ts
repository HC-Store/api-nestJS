import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { SiteConfigService } from './site-config.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { AdminGuard } from '../auth/admin.guard.js';

@Controller('site-config')
export class SiteConfigController {
  constructor(private readonly siteConfigService: SiteConfigService) {}

  // Público: o app lê o drop, banners etc.
  @Get()
  obter() {
    return this.siteConfigService.obter();
  }

  @Put()
  @UseGuards(JwtAuthGuard, AdminGuard)
  salvar(@Body() valor: Record<string, unknown>) {
    return this.siteConfigService.salvar(valor);
  }
}
