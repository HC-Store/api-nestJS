import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProdutoImagem } from './produto-imagem.entity.js';

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
}