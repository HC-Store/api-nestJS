# HC Store API

API REST da loja HC Store, usada pelo app mobile (`hcstore-mobile`), pelo site e pelo painel admin.

- **Stack:** NestJS 12, TypeORM, MySQL, JWT (Passport), Cloudinary, PagBank, Nodemailer
- **Runtime:** Node.js, módulos ES (`"type": "module"`, imports com `.js`)
- **Prefixo global:** todas as rotas ficam sob `/api` (ex.: `POST /api/auth/login`)
- **Testes:** Vitest · **Lint:** oxlint · **Formatação:** Prettier

Referência completa das rotas: [`docs/API.md`](docs/API.md). Modelo de dados e regras de negócio: [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md).

## Primeiros passos

### Requisitos
- Node.js (versão compatível com Nest 12 e TypeScript 6)
- MySQL 8 com um banco chamado `hcstore` (ou o nome definido em `DB_DATABASE`)

### Instalação

```bash
npm install
cp .env.example .env
```

Preencha o `.env` (veja a tabela abaixo) e rode:

```bash
npm run start:dev
```

A API sobe em `http://localhost:3000/api` (ou na `PORT` configurada).

> **Atenção ao banco:** `synchronize` está `false` em `src/app.module.ts` e o repositório não tem migrations. As tabelas precisam existir antes de iniciar. Os nomes são `usuario`, `endereco`, `categoria`, `produto`, `produtoImagem`, `carrinho`, `itemcarrinho`, `pedido`, `itempedido`, `cupom`, `cupomUso` e `configsite`.

### Variáveis de ambiente

| Variável | Obrigatória | Para que serve |
|---|---|---|
| `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE` | sim | Conexão MySQL (porta padrão 3306, banco `hcstore`) |
| `JWT_SECRET` | sim | Assina e valida o token. A API não sobe sem ela |
| `PORT` | não | Porta HTTP (padrão 3000) |
| `FRONTEND_URL` | não | Origem liberada no CORS e base do redirecionamento pós-pagamento. Sem ela, o CORS aceita qualquer origem |
| `API_PUBLIC_URL` | para pagamentos | URL pública da API, usada para montar a URL do webhook do PagBank |
| `PAGBANK_TOKEN` | para pagamentos | Token da API do PagBank. Sem ele, `POST /pagamentos/checkout` responde 503 |
| `PAGBANK_ENV` | não | `production` usa `api.pagseguro.com`; qualquer outro valor usa o sandbox |
| `PAGBANK_BASE_URL` | não | Sobrescreve a URL base do PagBank (útil para testes) |
| `PAGBANK_WEBHOOK_TOKEN` | para pagamentos | Segredo que o PagBank envia em `?token=` no webhook |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | não | Envio do e-mail de "pedido pago". Sem `SMTP_USER`/`SMTP_PASS`, nada é enviado |
| `ADMIN_NOTIFICATION_EMAIL` | não | Destinatário do aviso de pedido pago (padrão: `SMTP_USER`) |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | para upload | Upload de imagens de produto. **Não estão no `.env.example`** |

### Scripts

| Comando | O que faz |
|---|---|
| `npm run start:dev` | Servidor em modo watch |
| `npm run build` / `npm run start:prod` | Compila e roda `dist/main` |
| `npm test` | Testes unitários (Vitest) |
| `npm run test:e2e` | Testes e2e |
| `npm run test:cov` | Cobertura |
| `npm run lint` | oxlint em `src/` e `test/` |
| `npm run format` | Prettier |

## Estrutura

```
src/
  main.ts            prefixo /api, CORS
  app.module.ts      TypeORM (MySQL) e todos os módulos
  auth/              login, JwtStrategy, JwtAuthGuard, AdminGuard
  usuarios/          cadastro e dados do usuário (senha com bcrypt)
  enderecos/         endereços de entrega
  categorias/        categorias de produto
  produtos/          catálogo
  produto-imagem/    imagens do produto (upload no Cloudinary)
  carrinho/ itemcarrinho/   carrinho persistido
  pedidos/ itempedido/      pedidos e checkout
  pagamentos/        checkout hospedado e webhook do PagBank
  cupons/            cupons de desconto
  site-config/       conteúdo editável da home e dos drops (JSON)
  cloudinary/        provider do Cloudinary
```

## Autenticação

1. `POST /api/auth/login` com `{ "email", "senha" }` devolve `access_token` (JWT, validade de 1 dia) e `usuario` (`id`, `nome`, `email`).
2. As rotas protegidas exigem `Authorization: Bearer <access_token>`.
3. Rotas de admin usam `JwtAuthGuard` + `AdminGuard`, que consulta o banco e exige `usuario.role === 'ADMIN'`.

O app mobile guarda a sessão no aparelho e volta ao Login quando recebe 401.

## Fluxo de compra

1. O app envia `POST /api/pedidos/checkout` com endereço, itens e, opcionalmente, cupom e tipo de entrega.
2. O servidor recalcula tudo: preços vêm do banco, o estoque é validado e baixado dentro de uma transação, e o cupom é recalculado. O pedido nasce `PENDENTE`.
3. O app chama `POST /api/pagamentos/checkout` com o `pedidoId` e recebe `paymentUrl`, o link de pagamento do PagBank.
4. O PagBank chama `POST /api/pagamentos/webhook?token=...`. Se o pagamento estiver aprovado, o pedido vai para `PAGO` e, se o SMTP estiver configurado, sai um e-mail para o admin.

## Pontos de atenção

Observações da leitura do código, que valem tratar antes de produção. Detalhes em [`docs/API.md`](docs/API.md#permissões-por-rota).

- **Rotas sem proteção.** `usuarios` (listar, editar e desativar qualquer usuário), `produto-imagem` (criar, enviar e apagar imagens) e `enderecos` (`GET /` e `GET /:id`, que expõem endereços de todos) não têm guard.
- **Falta de checagem de admin e de dono.** Criar, editar e apagar produtos e categorias exige só login, não admin. Em `pedidos`, `carrinho`, `itemcarrinho` e `itempedido` qualquer usuário logado lê e altera registros de outros. Isso inclui mudar o `status` de um pedido via `PATCH /pedidos/:id`.
- **Possível escalada de privilégio.** Não há `ValidationPipe` global e `UsuariosService.update` espalha o corpo da requisição na atualização. Um `PUT /usuarios/:id` com `role: "ADMIN"` pode promover um usuário. Vale confirmar com um teste.
- **DTOs sem validação.** As classes em `dto/` não têm decorators do `class-validator`, então nada valida o formato dos campos.
- **Banco sem migrations**, e `.env.example` sem as variáveis do Cloudinary.
- **Erros inconsistentes.** Alguns `findOne` devolvem `200` com `{ "message": "... não encontrado" }` em vez de 404.
