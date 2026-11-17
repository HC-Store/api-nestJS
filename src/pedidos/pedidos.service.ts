
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';

import { Pedido, PedidoStatus } from './pedido.entity.js';
import { Usuario } from '../usuarios/usuario.entity.js';
import { Endereco } from '../enderecos/endereco.entity.js';
import { Produto } from '../produtos/produto.entity.js';
import { ItemPedido } from '../itempedido/itempedido.entity.js';
import { Cupom } from '../cupons/cupom.entity.js';
import { CupomUso } from '../cupons/cupom-uso.entity.js';
import {
  calcularDesconto,
  normalizarCodigo,
  validarRegrasCupom,
} from '../cupons/cupom.util.js';

@Injectable()
export class PedidosService {
  constructor(
    @InjectRepository(Pedido)
    private readonly pedidoRepository: Repository<Pedido>,

    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,

    @InjectRepository(Endereco)
    private readonly enderecoRepository: Repository<Endereco>,

    private readonly dataSource: DataSource,
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

  async findByUsuario(usuarioId: number) {
    return this.pedidoRepository.find({
      where: { usuarioId },
      relations: { endereco: true },
      order: { id: 'DESC' },
    });
  }


  // Cria o pedido a partir dos itens enviados pelo app, validando tudo no
  // servidor: preço vem do banco, estoque é conferido e baixado, e o cupom
  // é recalculado (nada de desconto/total vindo do cliente).
  async checkout(
    usuarioId: number,
    dados: {
      enderecoId: number;
      items: { produtoId: number; quantidade: number }[];
      tipoEntrega?: string | null;
      cupomCodigo?: string | null;
    },
  ) {
    if (!Array.isArray(dados.items) || dados.items.length === 0) {
      throw new BadRequestException('Carrinho vazio.');
    }

    // Junta itens repetidos e valida as quantidades
    const quantidades = new Map<number, number>();

    for (const item of dados.items) {
      const produtoId = Number(item.produtoId);
      const quantidade = Number(item.quantidade);

      if (!Number.isInteger(produtoId) || !Number.isInteger(quantidade) || quantidade < 1) {
        throw new BadRequestException('Item do carrinho inválido.');
      }

      quantidades.set(produtoId, (quantidades.get(produtoId) ?? 0) + quantidade);
    }

    const endereco = await this.enderecoRepository.findOne({
      where: { id: Number(dados.enderecoId) },
    });

    if (!endereco || endereco.usuarioId !== usuarioId) {
      throw new BadRequestException('Endereço inválido para este usuário.');
    }

    return this.dataSource.transaction(async (manager) => {
      const produtos = await manager.find(Produto, {
        where: { id: In([...quantidades.keys()]) },
        lock: { mode: 'pessimistic_write' },
      });

      let total = 0;

      for (const [produtoId, quantidade] of quantidades) {
        const produto = produtos.find((p) => p.id === produtoId);

        if (!produto) {
          throw new BadRequestException('Produto não encontrado no carrinho.');
        }

        if (produto.ativo === false) {
          throw new BadRequestException(
            `O produto "${produto.nome}" não está mais disponível.`,
          );
        }

        if (Number(produto.estoque) < quantidade) {
          throw new BadRequestException(
            `Estoque insuficiente para "${produto.nome}". Disponível: ${produto.estoque}`,
          );
        }

        total += Number(produto.preco) * quantidade;
      }

      total = Math.round(total * 100) / 100;

      let desconto = 0;
      let cupom: Cupom | null = null;
      const cupomCodigo = dados.cupomCodigo
        ? normalizarCodigo(dados.cupomCodigo)
        : null;

      if (cupomCodigo) {
        cupom = validarRegrasCupom(
          await manager.findOne(Cupom, { where: { codigo: cupomCodigo } }),
        );

        const usoExistente = await manager.findOne(CupomUso, {
          where: { cupomId: cupom.id, usuarioId },
        });

        if (usoExistente) {
          throw new BadRequestException('Este cupom já foi utilizado por esta conta.');
        }

        desconto = calcularDesconto(cupom, total);
      }

      const frete = 0;
      const totalFinal = Math.max(total + frete - desconto, 0);
      const agora = new Date();

      const pedido = await manager.save(
        manager.create(Pedido, {
          usuarioId,
          enderecoId: endereco.id,
          status: PedidoStatus.PENDENTE,
          total,
          frete,
          desconto,
          totalFinal,
          tipoEntrega: dados.tipoEntrega ?? null,
          cupomCodigo: cupom ? cupom.codigo : null,
          createdAt: agora,
          updatedAt: agora,
        }),
      );

      const itens: ItemPedido[] = [];

      for (const [produtoId, quantidade] of quantidades) {
        const produto = produtos.find((p) => p.id === produtoId) as Produto;

        itens.push(
          await manager.save(
            manager.create(ItemPedido, {
              pedidoId: pedido.id,
              produtoId,
              quantidade,
              preco: Number(produto.preco),
              updatedAt: agora,
            }),
          ),
        );

        // Baixa de estoque; zerou, desativa o produto (igual ao serviço antigo)
        const novoEstoque = Number(produto.estoque) - quantidade;

        await manager.update(Produto, produtoId, {
          estoque: Math.max(novoEstoque, 0),
          ...(novoEstoque <= 0 ? { ativo: false } : {}),
        });
      }

      if (cupom) {
        await manager.save(
          manager.create(CupomUso, {
            cupomId: cupom.id,
            usuarioId,
            createdAt: agora,
          }),
        );

        await manager.update(Cupom, cupom.id, {
          usado: cupom.usado + 1,
          updatedAt: agora,
        });
      }

      return { ...pedido, itens };
    });
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
