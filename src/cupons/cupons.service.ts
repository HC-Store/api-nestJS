import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cupom } from './cupom.entity.js';
import { CupomUso } from './cupom-uso.entity.js';
import {
  calcularDesconto,
  normalizarCodigo,
  validarRegrasCupom,
} from './cupom.util.js';

@Injectable()
export class CuponsService {
  constructor(
    @InjectRepository(Cupom)
    private readonly cupomRepository: Repository<Cupom>,

    @InjectRepository(CupomUso)
    private readonly cupomUsoRepository: Repository<CupomUso>,
  ) {}

  findAll() {
    return this.cupomRepository.find({ order: { createdAt: 'DESC' } });
  }

  async create(dados: {
    codigo: string;
    tipo: string;
    valor: number;
    ativo?: boolean;
    usoMaximo?: number | null;
  }) {
    const tipo = String(dados.tipo ?? '').toUpperCase();

    if (!dados.codigo || !tipo || !dados.valor) {
      throw new BadRequestException('Código, tipo e valor são obrigatórios.');
    }

    if (tipo !== 'PERCENTUAL' && tipo !== 'FIXO') {
      throw new BadRequestException('O tipo deve ser PERCENTUAL ou FIXO.');
    }

    const cupom = this.cupomRepository.create({
      codigo: normalizarCodigo(dados.codigo),
      tipo,
      valor: Number(dados.valor),
      ativo: dados.ativo === undefined ? true : Boolean(dados.ativo),
      usoMaximo: dados.usoMaximo ? Number(dados.usoMaximo) : null,
      usado: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.cupomRepository.save(cupom);
  }

  async remove(id: number) {
    await this.cupomRepository.delete(id);
    return { message: 'Cupom excluído com sucesso.' };
  }

  async validar(usuarioId: number, codigo: string, subtotal: number) {
    if (!codigo || !subtotal) {
      throw new BadRequestException('Código e subtotal são obrigatórios.');
    }

    const cupom = validarRegrasCupom(
      await this.cupomRepository.findOne({
        where: { codigo: normalizarCodigo(codigo) },
      }),
    );

    const usoExistente = await this.cupomUsoRepository.findOne({
      where: { cupomId: cupom.id, usuarioId },
    });

    if (usoExistente) {
      throw new BadRequestException('Este cupom já foi utilizado por esta conta.');
    }

    return {
      cupomId: cupom.id,
      codigo: cupom.codigo,
      desconto: calcularDesconto(cupom, Number(subtotal)),
    };
  }
}
