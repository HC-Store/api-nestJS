import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Carrinho } from './carrinho.entity.js';
import { Usuario } from '../usuarios/usuario.entity.js';
import { CreateCarrinhoDto } from './dto/create-carrinho.dto.js';

@Injectable()
export class CarrinhoService {
  constructor(
    @InjectRepository(Carrinho)
    private readonly carrinhoRepository: Repository<Carrinho>,

    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async findAll() {
    return this.carrinhoRepository.find();
  }

  async findOne(id: number) {
    const carrinho = await this.carrinhoRepository.findOne({
      where: { id },
    });

    if (!carrinho) {
      return { message: 'Carrinho não encontrado' };
    }

    return carrinho;
  }

  async create(createCarrinhoDto: CreateCarrinhoDto) {
    const usuario = await this.usuarioRepository.findOne({
      where: { id: createCarrinhoDto.usuarioId },
    });

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const carrinhoExistente = await this.carrinhoRepository.findOne({
      where: { usuarioId: createCarrinhoDto.usuarioId },
    });

    if (carrinhoExistente) {
      throw new ConflictException('Este usuário já possui um carrinho');
    }

    const carrinho = this.carrinhoRepository.create({
      usuarioId: createCarrinhoDto.usuarioId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.carrinhoRepository.save(carrinho);
  }
}