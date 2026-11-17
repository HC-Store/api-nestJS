import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigSite } from './config-site.entity.js';

const CHAVE = 'site-config';

const CONFIG_PADRAO = {
  home: {
    videoUrl: 'assets/video/banner-home.mp4',
    banner1: 'assets/img/nikegreen.jpg',
    banner2: 'assets/img/brinco.jpg',
    banner3: 'assets/img/baseball.webp',
    destaques: [],
    lancamentos: [],
  },
  colecoes: {
    bannerImagem: 'assets/img/banner-colecoes.png',
    dropTitulo: 'DROP 01:',
    dropSubtitulo: 'OFF-GRID',
    dropDescricao:
      'O OFF-GRID é um mergulho na textura brutalista da cidade.',
    dataLancamento: '',
  },
};

@Injectable()
export class SiteConfigService {
  constructor(
    @InjectRepository(ConfigSite)
    private readonly configRepository: Repository<ConfigSite>,
  ) {}

  async obter() {
    const config = await this.configRepository.findOne({
      where: { chave: CHAVE },
    });

    return config ? config.valor : CONFIG_PADRAO;
  }

  async salvar(valor: Record<string, unknown>) {
    if (!valor || typeof valor !== 'object' || Array.isArray(valor)) {
      throw new BadRequestException('Configuração inválida.');
    }

    const existente = await this.configRepository.findOne({
      where: { chave: CHAVE },
    });

    const config = this.configRepository.create({
      ...(existente ?? { chave: CHAVE, createdAt: new Date() }),
      valor,
      updatedAt: new Date(),
    });

    return (await this.configRepository.save(config)).valor;
  }
}
