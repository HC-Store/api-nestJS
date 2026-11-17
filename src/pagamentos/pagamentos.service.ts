import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { timingSafeEqual } from 'node:crypto';
import { Repository } from 'typeorm';
import nodemailer from 'nodemailer';
import { Pedido, PedidoStatus } from '../pedidos/pedido.entity.js';
import { ItemPedido } from '../itempedido/itempedido.entity.js';

const PREFIXO_REFERENCIA = 'HCSTORE-PEDIDO-';

@Injectable()
export class PagamentosService {
  private readonly logger = new Logger(PagamentosService.name);

  constructor(
    @InjectRepository(Pedido)
    private readonly pedidoRepository: Repository<Pedido>,

    @InjectRepository(ItemPedido)
    private readonly itemPedidoRepository: Repository<ItemPedido>,
  ) {}

  private get baseUrl() {
    // PAGBANK_BASE_URL permite apontar para um servidor de teste
    if (process.env.PAGBANK_BASE_URL) {
      return process.env.PAGBANK_BASE_URL;
    }

    return process.env.PAGBANK_ENV === 'production'
      ? 'https://api.pagseguro.com'
      : 'https://sandbox.api.pagseguro.com';
  }

  // Cria o checkout hospedado do PagBank para um pedido do usuário logado.
  // Valores vêm do banco (itens e desconto do pedido), não do cliente.
  async criarCheckout(usuarioId: number, pedidoId: number) {
    if (!process.env.PAGBANK_TOKEN) {
      throw new ServiceUnavailableException('Pagamento não configurado.');
    }

    const pedido = await this.pedidoRepository.findOne({
      where: { id: Number(pedidoId) },
    });

    if (!pedido || pedido.usuarioId !== usuarioId) {
      throw new NotFoundException('Pedido não encontrado');
    }

    if (pedido.status !== PedidoStatus.PENDENTE) {
      throw new BadRequestException('Este pedido não está aguardando pagamento.');
    }

    const itens = await this.itemPedidoRepository.find({
      where: { pedidoId: pedido.id },
      relations: { produto: true },
    });

    if (itens.length === 0) {
      throw new BadRequestException('Pedido sem itens.');
    }

    const corpo: Record<string, unknown> = {
      reference_id: `${PREFIXO_REFERENCIA}${pedido.id}`,
      discount_amount: Math.round(Number(pedido.desconto ?? 0) * 100),
      items: itens.map((item) => ({
        reference_id: String(item.produtoId),
        name: item.produto?.nome ?? `Produto ${item.produtoId}`,
        quantity: Number(item.quantidade),
        unit_amount: Math.round(Number(item.preco) * 100),
      })),
    };

    if (process.env.FRONTEND_URL) {
      corpo.redirect_url = `${process.env.FRONTEND_URL}/pagamento/sucesso`;
    }

    // URL pública do back + token secreto para o PagBank avisar o pagamento
    if (process.env.API_PUBLIC_URL && process.env.PAGBANK_WEBHOOK_TOKEN) {
      corpo.notification_urls = [
        `${process.env.API_PUBLIC_URL}/api/pagamentos/webhook?token=${encodeURIComponent(
          process.env.PAGBANK_WEBHOOK_TOKEN,
        )}`,
      ];
    }

    const resposta = await fetch(`${this.baseUrl}/checkouts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAGBANK_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(corpo),
    });

    const dados = (await resposta.json().catch(() => null)) as {
      links?: { rel: string; href: string }[];
    } | null;

    if (!resposta.ok) {
      this.logger.error(`PagBank recusou o checkout: ${JSON.stringify(dados)}`);
      throw new ServiceUnavailableException('Erro ao criar checkout no PagBank.');
    }

    const link = dados?.links?.find((l) => l.rel === 'PAY');

    if (!link) {
      throw new ServiceUnavailableException('PagBank não retornou o link de pagamento.');
    }

    return { paymentUrl: link.href, pedidoId: pedido.id };
  }

  private tokenValido(token?: string) {
    const esperado = process.env.PAGBANK_WEBHOOK_TOKEN;

    if (!esperado || !token) {
      return false;
    }

    const a = Buffer.from(token);
    const b = Buffer.from(esperado);

    return a.length === b.length && timingSafeEqual(a, b);
  }

  async processarWebhook(token: string | undefined, body: any) {
    // Sem o token secreto qualquer pessoa poderia marcar pedidos como pagos
    if (!this.tokenValido(token)) {
      throw new UnauthorizedException('Webhook não autorizado.');
    }

    const referenceId =
      body?.reference_id ??
      body?.checkout?.reference_id ??
      body?.data?.reference_id ??
      body?.resource?.reference_id;

    const status =
      body?.status ??
      body?.checkout?.status ??
      body?.data?.status ??
      body?.resource?.status;

    if (!referenceId || !String(referenceId).startsWith(PREFIXO_REFERENCIA)) {
      return { received: true, message: 'Webhook sem pedido da HC Store.' };
    }

    const pedidoId = Number(String(referenceId).replace(PREFIXO_REFERENCIA, ''));
    const statusNormalizado = String(status ?? '').toUpperCase();

    if (!pedidoId || !['PAID', 'PAGO', 'AUTHORIZED', 'APPROVED'].includes(statusNormalizado)) {
      return { received: true, message: `Status sem baixa: ${statusNormalizado}` };
    }

    const pedido = await this.pedidoRepository.findOne({
      where: { id: pedidoId },
      relations: { usuario: true },
    });

    if (!pedido) {
      return { received: true, message: 'Pedido não encontrado.' };
    }

    if (pedido.status !== PedidoStatus.PENDENTE) {
      return { received: true, message: 'Pedido já processado.' };
    }

    pedido.status = PedidoStatus.PAGO;
    pedido.updatedAt = new Date();
    await this.pedidoRepository.save(pedido);

    await this.enviarEmailPedidoPago(pedido).catch((erro) =>
      this.logger.error(`Falha ao enviar e-mail do pedido ${pedido.id}: ${erro}`),
    );

    return { received: true, message: 'Pedido atualizado para PAGO.', pedidoId };
  }

  private async enviarEmailPedidoPago(pedido: Pedido) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return;
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    const valor = Number(pedido.totalFinal ?? pedido.total).toFixed(2);

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: process.env.ADMIN_NOTIFICATION_EMAIL ?? process.env.SMTP_USER,
      subject: `HC Store - Pedido #${pedido.id} pago`,
      html: `
        <h2>Novo pedido pago na HC Store</h2>
        <p><strong>Pedido:</strong> #${pedido.id}</p>
        <p><strong>Total final:</strong> R$ ${valor}</p>
        <p><strong>Cliente:</strong> ${pedido.usuario?.nome ?? ''} ${pedido.usuario?.sobrenome ?? ''}</p>
        <p><strong>E-mail:</strong> ${pedido.usuario?.email ?? ''}</p>
        <p><strong>Telefone:</strong> ${pedido.usuario?.telefone ?? ''}</p>
      `,
    });
  }
}
