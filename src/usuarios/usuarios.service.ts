
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { Usuario, UsuarioRole } from './usuario.entity.js';
import { CreateUsuarioDto } from './dto/create-usuario.dto.js';
import { UpdateUsuarioDto } from './dto/update-usuario.dto.js';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async findByEmail(email: string) {
    return this.usuarioRepository.findOne({
      where: {
        email,
        ativo: true,
      },
    });
  }

  async findAll() {
    const usuarios = await this.usuarioRepository.find();

    return usuarios.map(({ senha, ...usuario }) => usuario);
  }

  async findOne(id: number) {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
    });

    if (!usuario) {
      return {
        message: 'Usuário não encontrado',
      };
    }

    const { senha, ...usuarioSemSenha } = usuario;

    return usuarioSemSenha;
  }

  async create(createUsuarioDto: CreateUsuarioDto) {
    const emailExiste = await this.usuarioRepository.findOne({
      where: { email: createUsuarioDto.email },
    });

    if (emailExiste) {
      throw new ConflictException('Este e-mail já está cadastrado');
    }

    const cpfExiste = await this.usuarioRepository.findOne({
      where: { cpf: createUsuarioDto.cpf },
    });

    if (cpfExiste) {
      throw new ConflictException('Este CPF já está cadastrado');
    }

    const senhaHash = await bcrypt.hash(createUsuarioDto.senha, 10);

    const usuario = this.usuarioRepository.create({
      ...createUsuarioDto,
      senha: senhaHash,
      dataNascimento: new Date(createUsuarioDto.dataNascimento),
      ativo: true,
      role: UsuarioRole.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const usuarioSalvo = await this.usuarioRepository.save(usuario);

    const { senha, ...usuarioSemSenha } = usuarioSalvo;

    return usuarioSemSenha;
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
    });

    if (!usuario) {
      return {
        message: 'Usuário não encontrado',
      };
    }

    if (
      updateUsuarioDto.email &&
      updateUsuarioDto.email !== usuario.email
    ) {
      const emailExiste = await this.usuarioRepository.findOne({
        where: { email: updateUsuarioDto.email },
      });

      if (emailExiste) {
        throw new ConflictException('Este e-mail já está cadastrado');
      }
    }

    if (
      updateUsuarioDto.cpf &&
      updateUsuarioDto.cpf !== usuario.cpf
    ) {
      const cpfExiste = await this.usuarioRepository.findOne({
        where: { cpf: updateUsuarioDto.cpf },
      });

      if (cpfExiste) {
        throw new ConflictException('Este CPF já está cadastrado');
      }
    }

    const dadosAtualizados: Partial<Usuario> = {
      ...updateUsuarioDto,
      updatedAt: new Date(),
    };

    if (updateUsuarioDto.senha) {
      dadosAtualizados.senha = await bcrypt.hash(
        updateUsuarioDto.senha,
        10,
      );
    }

    if (updateUsuarioDto.dataNascimento) {
      dadosAtualizados.dataNascimento = new Date(
        updateUsuarioDto.dataNascimento,
      );
    }

    await this.usuarioRepository.update(id, dadosAtualizados);

    const usuarioAtualizado = await this.usuarioRepository.findOne({
      where: { id },
    });

    if (!usuarioAtualizado) {
      return {
        message: 'Usuário não encontrado',
      };
    }

    const { senha, ...usuarioSemSenha } = usuarioAtualizado;

    return usuarioSemSenha;
  }

  async remove(id: number) {
    const usuario = await this.usuarioRepository.findOne({
      where: { id },
    });

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    await this.usuarioRepository.update(id, {
      ativo: false,
      updatedAt: new Date(),
    });

    return {
      message: 'Usuário desativado com sucesso',
    };
  }
}
