import {
  Body,
  Controller,
  HttpCode,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PagamentosService } from './pagamentos.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller('pagamentos')
export class PagamentosController {
  constructor(private readonly pagamentosService: PagamentosService) {}

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  checkout(
    @Req() req: { user: { id: number } },
    @Body() dados: { pedidoId: number },
  ) {
    return this.pagamentosService.criarCheckout(req.user.id, dados.pedidoId);
  }

  // Chamado pelo PagBank; protegido pelo token na URL (PAGBANK_WEBHOOK_TOKEN)
  @Post('webhook')
  @HttpCode(200)
  webhook(@Query('token') token: string | undefined, @Body() body: unknown) {
    return this.pagamentosService.processarWebhook(token, body);
  }
}
