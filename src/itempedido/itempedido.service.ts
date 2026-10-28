
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ItemPedido } from './itempedido.entity.js';
import { Pedido } from '../pedidos/pedido.entity.js';
import { Produto } from '../produtos/produto.entity.js';

@Injectable()
export class ItemPedidoService {
  constructor(
    @InjectRepository(ItemPedido)
    private readonly itemPedidoRepository: Repository<ItemPedido>,

    @InjectRepository(Pedido)
    private readonly pedidoRepository: Repository<Pedido>,

    @InjectRepository(Produto)
    private readonly produtoRepository: Repository<Produto>,
  ) {}

  async findAll() {
    return this.itemPedidoRepository.find({
      relations: {
        pedido: true,
        produto: true,
      },
    });
  }

  async findOne(id: number) {
    const item = await this.itemPedidoRepository.findOne({
      where: { id },
      relations: {
        pedido: true,
        produto: true,
      },
    });

    if (!item) {
      throw new NotFoundException('Item do pedido não encontrado');
    }

    return item;
  }

  async create(dados: {
    pedidoId: number;
    produtoId: number;
    quantidade: number;
    preco: number;
  }) {
    const pedido = await this.pedidoRepository.findOne({
      where: { id: dados.pedidoId },
    });

    if (!pedido) {
      throw new NotFoundException('Pedido não encontrado');
    }

    const produto = await this.produtoRepository.findOne({
      where: { id: dados.produtoId },
    });

    if (!produto) {
      throw new NotFoundException('Produto não encontrado');
    }

    if (
      !Number.isInteger(dados.quantidade) ||
      dados.quantidade <= 0
    ) {
      throw new BadRequestException(
        'A quantidade deve ser um número inteiro positivo',
      );
    }

    if (!Number.isFinite(dados.preco) || dados.preco < 0) {
      throw new BadRequestException('O preço do item é inválido');
    }

    const item = this.itemPedidoRepository.create({
      pedidoId: dados.pedidoId,
      produtoId: dados.produtoId,
      quantidade: dados.quantidade,
      preco: dados.preco,
      updatedAt: new Date(),
    });

    return this.itemPedidoRepository.save(item);
  }

  async update(
    id: number,
    dados: {
      quantidade?: number;
      preco?: number;
    },
  ) {
    const item = await this.itemPedidoRepository.findOne({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException('Item do pedido não encontrado');
    }

    if (dados.quantidade !== undefined) {
      if (
        !Number.isInteger(dados.quantidade) ||
        dados.quantidade <= 0
      ) {
        throw new BadRequestException(
          'A quantidade deve ser um número inteiro positivo',
        );
      }

      item.quantidade = dados.quantidade;
    }

    if (dados.preco !== undefined) {
      if (!Number.isFinite(dados.preco) || dados.preco < 0) {
        throw new BadRequestException('O preço do item é inválido');
      }

      item.preco = dados.preco;
    }

    item.updatedAt = new Date();

    return this.itemPedidoRepository.save(item);
  }

  async remove(id: number) {
    const item = await this.itemPedidoRepository.findOne({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException('Item do pedido não encontrado');
    }

    await this.itemPedidoRepository.remove(item);

    return {
      message: 'Item do pedido removido com sucesso',
    };
  }
}
