import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categoria } from './categoria.entity.js';

@Injectable()
export class CategoriasService {
  constructor(
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,
  ) {}

  async findAll() {
  return this.categoriaRepository.find();
}

async create(nome: string) {
  const categoria = this.categoriaRepository.create({ nome });

  return this.categoriaRepository.save(categoria);
}


}
