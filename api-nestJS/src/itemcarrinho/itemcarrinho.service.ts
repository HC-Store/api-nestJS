
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ItemCarrinho } from './itemcarrinho.entity.js';
import { Carrinho } from '../carrinho/carrinho.entity.js';
import { Produto } from '../produtos/produto.entity.js';

@Injectable()
export class ItemCarrinhoService {
  constructor(
    @InjectRepository(ItemCarrinho)
    private readonly itemCarrinhoRepository: Repository<ItemCarrinho>,

    @InjectRepository(Carrinho)
    private readonly carrinhoRepository: Repository<Carrinho>,

    @InjectRepository(Produto)
    private readonly produtoRepository: Repository<Produto>,
  ) {}

  async findAll() {
    return this.itemCarrinhoRepository.find({
      relations: {
        carrinho: true,
        produto: true,
      },
    });
  }

  async findOne(id: number) {
    const item = await this.itemCarrinhoRepository.findOne({
      where: { id },
      relations: {
        carrinho: true,
        produto: true,
      },
    });

    if (!item) {
      throw new NotFoundException('Item do carrinho não encontrado');
    }

    return item;
  }

  async create(dados: {
    carrinhoId: number;
    produtoId: number;
    quantidade: number;
  }) {
    if (!Number.isInteger(dados.quantidade) || dados.quantidade < 1) {
      throw new BadRequestException(
        'A quantidade deve ser um número inteiro maior que zero',
      );
    }

    const carrinho = await this.carrinhoRepository.findOne({
      where: { id: dados.carrinhoId },
    });

    if (!carrinho) {
      throw new NotFoundException('Carrinho não encontrado');
    }

    const produto = await this.produtoRepository.findOne({
      where: { id: dados.produtoId },
    });

    if (!produto) {
      throw new NotFoundException('Produto não encontrado');
    }

    const item = this.itemCarrinhoRepository.create({
      carrinhoId: dados.carrinhoId,
      produtoId: dados.produtoId,
      quantidade: dados.quantidade,
      updatedAt: new Date(),
    });

    return this.itemCarrinhoRepository.save(item);
  }

  async update(
    id: number,
    dados: {
      quantidade?: number;
    },
  ) {
    const item = await this.itemCarrinhoRepository.findOne({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException('Item do carrinho não encontrado');
    }

    if (dados.quantidade !== undefined) {
      if (
        !Number.isInteger(dados.quantidade) ||
        dados.quantidade < 1
      ) {
        throw new BadRequestException(
          'A quantidade deve ser um número inteiro maior que zero',
        );
      }

      item.quantidade = dados.quantidade;
    }

    item.updatedAt = new Date();

    return this.itemCarrinhoRepository.save(item);
  }

  async remove(id: number) {
    const item = await this.itemCarrinhoRepository.findOne({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException('Item do carrinho não encontrado');
    }

    await this.itemCarrinhoRepository.remove(item);

    return {
      message: 'Item removido do carrinho com sucesso',
    };
  }
}
