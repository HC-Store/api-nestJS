
import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v2 as Cloudinary } from 'cloudinary';
import { Readable } from 'node:stream';

import { ProdutoImagem } from './produto-imagem.entity.js';
import { CreateProdutoImagemDto } from './dto/create-produto-imagem.dto.js';
import { UploadedImage } from './dto/interfaces/uploaded-image.interface.js';

@Injectable()
export class ProdutoImagemService {
  constructor(
    @InjectRepository(ProdutoImagem)
    private readonly produtoImagemRepository: Repository<ProdutoImagem>,

    @Inject('CLOUDINARY')
    private readonly cloudinary: typeof Cloudinary,
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

  async uploadImage(file: UploadedImage, produtoId: number) {
    const resultado = await new Promise<{ secure_url: string }>(
      (resolve, reject) => {
        const upload = this.cloudinary.uploader.upload_stream(
          {
            folder: 'hcstore/produtos',
            resource_type: 'image',
          },
          (error, result) => {
            if (error) {
              reject(error);
              return;
            }

            if (!result) {
              reject(
                new Error('O Cloudinary não retornou o resultado do upload.'),
              );
              return;
            }

            resolve(result);
          },
        );

        Readable.from(file.buffer).pipe(upload);
      },
    );

    const produtoImagem = this.produtoImagemRepository.create({
      produtoId,
      url: resultado.secure_url,
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
