
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Pedido, PedidoStatus } from './pedido.entity.js';
import { Usuario } from '../usuarios/usuario.entity.js';
import { Endereco } from '../enderecos/endereco.entity.js';

@Injectable()
export class PedidosService {
  constructor(
    @InjectRepository(Pedido)
    private readonly pedidoRepository: Repository<Pedido>,

    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,

    @InjectRepository(Endereco)
    private readonly enderecoRepository: Repository<Endereco>,
  ) {}

  private ocultarSenha(pedido: Pedido) {
    if (!pedido.usuario) {
      return pedido;
    }

    const usuarioSemSenha: Partial<Usuario> = {
      ...pedido.usuario,
    };

    delete usuarioSemSenha.senha;

    return {
      ...pedido,
      usuario: usuarioSemSenha,
    };
  }

  async findAll() {
    const pedidos = await this.pedidoRepository.find({
      relations: {
        usuario: true,
        endereco: true,
      },
    });

    return pedidos.map((pedido) => this.ocultarSenha(pedido));
  }

  async findOne(id: number) {
    const pedido = await this.pedidoRepository.findOne({
      where: { id },
      relations: {
        usuario: true,
        endereco: true,
      },
    });

    if (!pedido) {
      throw new NotFoundException('Pedido não encontrado');
    }

    return this.ocultarSenha(pedido);
  }

  async create(dados: {
    usuarioId: number;
    enderecoId: number;
    total: number;
    frete?: number | null;
    desconto?: number | null;
    totalFinal?: number | null;
    tipoEntrega?: string | null;
    cupomCodigo?: string | null;
    status?: PedidoStatus;
  }) {
    const usuario = await this.usuarioRepository.findOne({
      where: { id: dados.usuarioId },
    });

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const endereco = await this.enderecoRepository.findOne({
      where: { id: dados.enderecoId },
    });

    if (!endereco) {
      throw new NotFoundException('Endereço não encontrado');
    }

    if (endereco.usuarioId !== dados.usuarioId) {
      throw new BadRequestException(
        'O endereço não pertence ao usuário informado',
      );
    }

    if (!Number.isFinite(dados.total) || dados.total < 0) {
      throw new BadRequestException('O total do pedido é inválido');
    }

    const pedido = this.pedidoRepository.create({
      usuarioId: dados.usuarioId,
      enderecoId: dados.enderecoId,
      total: dados.total,
      frete: dados.frete ?? null,
      desconto: dados.desconto ?? null,
      totalFinal: dados.totalFinal ?? null,
      tipoEntrega: dados.tipoEntrega ?? null,
      cupomCodigo: dados.cupomCodigo ?? null,
      status: dados.status ?? PedidoStatus.PENDENTE,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.pedidoRepository.save(pedido);
  }

  async update(
    id: number,
    dados: {
      status?: PedidoStatus;
      total?: number;
      frete?: number | null;
      desconto?: number | null;
      totalFinal?: number | null;
      tipoEntrega?: string | null;
      cupomCodigo?: string | null;
    },
  ) {
    const pedido = await this.pedidoRepository.findOne({
      where: { id },
    });

    if (!pedido) {
      throw new NotFoundException('Pedido não encontrado');
    }

    if (dados.total !== undefined) {
      if (!Number.isFinite(dados.total) || dados.total < 0) {
        throw new BadRequestException('O total do pedido é inválido');
      }

      pedido.total = dados.total;
    }

    if (dados.status !== undefined) {
      pedido.status = dados.status;
    }

    if (dados.frete !== undefined) {
      pedido.frete = dados.frete;
    }

    if (dados.desconto !== undefined) {
      pedido.desconto = dados.desconto;
    }

    if (dados.totalFinal !== undefined) {
      pedido.totalFinal = dados.totalFinal;
    }

    if (dados.tipoEntrega !== undefined) {
      pedido.tipoEntrega = dados.tipoEntrega;
    }

    if (dados.cupomCodigo !== undefined) {
      pedido.cupomCodigo = dados.cupomCodigo;
    }

    pedido.updatedAt = new Date();

    return this.pedidoRepository.save(pedido);
  }

  async remove(id: number) {
    const pedido = await this.pedidoRepository.findOne({
      where: { id },
    });

    if (!pedido) {
      throw new NotFoundException('Pedido não encontrado');
    }

    await this.pedidoRepository.remove(pedido);

    return {
      message: 'Pedido removido com sucesso',
    };
  }
}
