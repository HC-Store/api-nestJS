import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProdutoImagem } from './produto-imagem.entity.js';
import { CreateProdutoImagemDto } from './dto/create-produto-imagem.dto.js';

@Injectable()
export class ProdutoImagemService {
  constructor(
    @InjectRepository(ProdutoImagem)
    private readonly produtoImagemRepository: Repository<ProdutoImagem>,
  ) {}

  async findAll() {
    return this.produtoImagemRepository.find();
  }

  async findByProdutoId(produtoId: number) {
    return this.produtoImagemRepository.find({
      where: { produtoId },
    });
  }

  async create(createProdutoImagemDto: CreateProdutoImagemDto) {
  const produtoImagem = this.produtoImagemRepository.create({
    ...createProdutoImagemDto,
  });

  return this.produtoImagemRepository.save(produtoImagem);
}

async remove(id: number) {
  await this.produtoImagemRepository.delete(id);

  return {
    message: 'Imagem do produto deletada com sucesso',
  };
}



}