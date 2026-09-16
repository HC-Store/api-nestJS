import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Produto } from './produto.entity.js';
import { CreateProdutoDto } from './dto/create-produto.dto.js';
import { UpdateProdutoDto } from './dto/update-produto.dto.js';

@Injectable()
export class ProdutosService {
  constructor(
    @InjectRepository(Produto)
    private readonly produtoRepository: Repository<Produto>,
  ) {}

  async findAll() {
    return this.produtoRepository.find();
  }

  async findOne(id: number) {
  return this.produtoRepository.findOne({
    where: { id },
    relations: {
      categoria: true,
    },
  });
}

async create(createProdutoDto: CreateProdutoDto) {
  const produto = this.produtoRepository.create({
    ...createProdutoDto,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return this.produtoRepository.save(produto);
}

async update(id: number, updateProdutoDto: UpdateProdutoDto) {
  await this.produtoRepository.update(id, {
    ...updateProdutoDto,
    updatedAt: new Date(),
  });

  return this.produtoRepository.findOne({
    where: { id },
    relations: {
      categoria: true,
    },
  });
}

async remove(id: number) {
  await this.produtoRepository.delete(id);

  return {
    message: 'Produto deletado com sucesso',
  };
}


}