import { BadRequestException } from '@nestjs/common';
import { Cupom } from './cupom.entity.js';

export const normalizarCodigo = (codigo: string) =>
  String(codigo ?? '').toUpperCase().trim();

// Regras do cupom (ativo, limite de uso). Não checa uso por usuário.
export function validarRegrasCupom(cupom: Cupom | null): Cupom {
  if (!cupom || !cupom.ativo) {
    throw new BadRequestException('Cupom inválido ou inativo.');
  }

  if (cupom.usoMaximo && cupom.usado >= cupom.usoMaximo) {
    throw new BadRequestException('Cupom atingiu o limite de uso.');
  }

  return cupom;
}

export function calcularDesconto(cupom: Cupom, subtotal: number): number {
  let desconto = 0;

  if (cupom.tipo === 'PERCENTUAL') {
    desconto = subtotal * (Number(cupom.valor) / 100);
  }

  if (cupom.tipo === 'FIXO') {
    desconto = Number(cupom.valor);
  }

  desconto = Math.min(desconto, subtotal);

  return Math.round(desconto * 100) / 100;
}
