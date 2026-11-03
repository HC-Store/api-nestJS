import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Endereco } from './endereco.entity.js';
import { CreateEnderecoDto } from './dto/create-endereco.dto.js';
import { UpdateEnderecoDto } from './dto/update-endereco.dto.js';

@Injectable()
export class EnderecosService {
  constructor(
    @InjectRepository(Endereco)
    private readonly enderecoRepository: Repository<Endereco>,
  ) {}

  async findAll() {
    return this.enderecoRepository.find();
  }

  async findOne(id: number) {
    const endereco = await this.enderecoRepository.findOne({
      where: { id },
    });

    if (!endereco) {
      return { message: 'Endereço não encontrado' };
    }

    return endereco;
  }

  async create(createEnderecoDto: CreateEnderecoDto) {
    const endereco = this.enderecoRepository.create({
      ...createEnderecoDto,
      updatedAt: new Date(),
    });

    return this.enderecoRepository.save(endereco);
  }

  async update(id: number, updateEnderecoDto: UpdateEnderecoDto) {
  const endereco = await this.enderecoRepository.findOne({
    where: { id },
  });

  if (!endereco) {
    return { message: 'Endereço não encontrado' };
  }

  await this.enderecoRepository.update(id, {
    ...updateEnderecoDto,
    updatedAt: new Date(),
  });

  return this.enderecoRepository.findOne({
    where: { id },
  });
}

async remove(id: number) {
  const endereco = await this.enderecoRepository.findOne({
    where: { id },
  });

  if (!endereco) {
    return { message: 'Endereço não encontrado' };
  }

  await this.enderecoRepository.delete(id);

  return { message: 'Endereço excluído com sucesso' };
}
}