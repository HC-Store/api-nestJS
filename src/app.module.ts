
import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { CategoriasModule } from './categorias/categorias.module.js';
import { ProdutosModule } from './produtos/produtos.module.js';
import { ProdutoImagemModule } from './produto-imagem/produto-imagem.module.js';
import { UsuariosModule } from './usuarios/usuarios.module.js';
import { EnderecosModule } from './enderecos/enderecos.module.js';
import { CarrinhoModule } from './carrinho/carrinho.module.js';
import { ItemCarrinhoModule } from './itemcarrinho/itemcarrinho.module.js';
import { PedidosModule } from './pedidos/pedidos.module.js';
import { ItemPedidoModule } from './itempedido/itempedido.module.js';
import { AuthModule } from './auth/auth.module.js';
import { CuponsModule } from './cupons/cupons.module.js';
import { SiteConfigModule } from './site-config/site-config.module.js';
import { PagamentosModule } from './pagamentos/pagamentos.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      autoLoadEntities: true,
      synchronize: false,
    }),

    CategoriasModule,
    ProdutosModule,
    ProdutoImagemModule,
    UsuariosModule,
    EnderecosModule,
    CarrinhoModule,
    ItemCarrinhoModule,
    PedidosModule,
    ItemPedidoModule,
    AuthModule,
    CuponsModule,
    SiteConfigModule,
    PagamentosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
