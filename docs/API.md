# Referência da API

Base URL: `{API_URL}/api` (local: `http://localhost:3000/api`). Corpo e resposta em JSON, exceto o upload de imagem (`multipart/form-data`).

Legenda de acesso: **Público** · **JWT** (`Authorization: Bearer <token>`) · **Admin** (JWT + `role = ADMIN`).

## Permissões por rota

| Recurso | Rota | Acesso |
|---|---|---|
| App | `GET /` | Público |
| Auth | `POST /auth/login` | Público |
| Usuários | `GET /usuarios`, `GET /usuarios/:id`, `POST /usuarios`, `PUT /usuarios/:id`, `DELETE /usuarios/:id` | **Público (sem guard)** |
| Endereços | `GET /enderecos`, `GET /enderecos/:id` | **Público** |
| | `GET /enderecos/meus`, `POST`, `PUT /:id`, `DELETE /:id` | JWT |
| Categorias | `GET /categorias`, `GET /categorias/:id` | Público |
| | `POST /categorias` | JWT |
| Produtos | `GET /produtos`, `GET /produtos/:id` | Público |
| | `POST`, `PUT /:id`, `DELETE /:id`, `PATCH /:id/status` | JWT (não exige admin) |
| Imagens | `GET /produto-imagem`, `GET /produto-imagem/produto/:produtoId`, `POST`, `POST /upload/:produtoId`, `DELETE /:id` | **Público (sem guard)** |
| Carrinho | `GET`, `GET /:id`, `POST` em `/carrinho` | JWT |
| Itens do carrinho | `GET`, `GET /:id`, `POST`, `PATCH /:id`, `DELETE /:id` em `/itemcarrinho` | JWT |
| Pedidos | todas as rotas de `/pedidos` | JWT (sem admin e sem checagem de dono, exceto `/meus` e `/checkout`) |
| Itens do pedido | `GET`, `GET /:id`, `POST`, `PATCH /:id`, `DELETE /:id` em `/itempedido` | JWT |
| Pagamentos | `POST /pagamentos/checkout` | JWT |
| | `POST /pagamentos/webhook?token=` | Público, protegido por token secreto |
| Cupons | `POST /cupons/validar` | JWT |
| | `GET /cupons`, `POST /cupons`, `DELETE /cupons/:id` | Admin |
| Config do site | `GET /site-config` | Público |
| | `PUT /site-config` | Admin |

---

## Auth

### `POST /auth/login`
```json
{ "email": "cliente@exemplo.com", "senha": "segredo" }
```
**200**
```json
{ "access_token": "<jwt, validade 1d>", "usuario": { "id": 1, "nome": "Ana", "email": "cliente@exemplo.com" } }
```
**400** e-mail ou senha ausentes ou não string · **401** `E-mail ou senha inválidos` (também para usuário desativado).

Payload do JWT: `{ sub: <id>, email }`.

## Usuários

Campos de `Usuario`: `id`, `nome`, `sobrenome`, `email` (único), `senha` (hash bcrypt, nunca devolvida), `cpf` (único), `telefone`, `sexo`, `dataNascimento`, `ativo`, `role` (`USER` | `ADMIN`), `createdAt`, `updatedAt`.

### `POST /usuarios`
Corpo: `nome`, `sobrenome`, `email`, `senha`, `cpf`, `telefone`, `sexo`, `dataNascimento`. Cria com `role = USER` e `ativo = true`. **409** se e-mail ou CPF já existirem. Devolve o usuário sem senha.

### `GET /usuarios` · `GET /usuarios/:id`
Listam usuários sem a senha. `:id` inexistente devolve `200` com `{ "message": "Usuário não encontrado" }`.

### `PUT /usuarios/:id`
Atualização parcial (mesmos campos do cadastro). Valida unicidade de e-mail e CPF e refaz o hash se vier `senha`.

### `DELETE /usuarios/:id`
Desativação lógica (`ativo = false`). **404** se não existir.

## Endereços

`Endereco`: `id`, `rua`, `numero`, `cidade`, `estado`, `cep`, `usuarioId`, `updatedAt`.

- `GET /enderecos/meus` (JWT): endereços do usuário logado.
- `POST /enderecos` (JWT): corpo `rua`, `numero`, `cidade`, `estado`, `cep`, `usuarioId`.
- `PUT /enderecos/:id` (JWT): atualização parcial.
- `DELETE /enderecos/:id` (JWT).
- `GET /enderecos` e `GET /enderecos/:id`: públicos.

## Categorias e produtos

`Categoria`: `id`, `nome`. `POST /categorias` recebe `{ "nome": "Camisetas" }`.

`Produto`: `id`, `nome`, `descricao`, `preco` (decimal 10,2), `estoque`, `categoriaId`, `marca`, `tamanho`, `composicaoMaterial`, `instrucaoLavagem`, `enviosDevolucoes`, `quantidadePorTamanho`, `ativo` (padrão `true`), `createdAt`, `updatedAt`.

| Rota | Descrição |
|---|---|
| `GET /produtos` | Lista todos (inclusive inativos) |
| `GET /produtos/:id` | Um produto com `categoria` |
| `POST /produtos` | Cria. Obrigatórios: `nome`, `descricao`, `preco`, `estoque`, `categoriaId` |
| `PUT /produtos/:id` | Atualização parcial; devolve o produto com categoria |
| `PATCH /produtos/:id/status` | Corpo `{ "ativo": false }`. Liga ou desliga o produto |
| `DELETE /produtos/:id` | Remove (apaga as imagens em cascata) |

### Imagens do produto
`ProdutoImagem`: `id`, `url`, `produtoId`.

| Rota | Descrição |
|---|---|
| `GET /produto-imagem` | Todas |
| `GET /produto-imagem/produto/:produtoId` | Imagens de um produto |
| `POST /produto-imagem` | Registra uma URL já existente: `{ "url", "produtoId" }` |
| `POST /produto-imagem/upload/:produtoId` | `multipart/form-data`, campo de arquivo `imagem`. Só aceita `image/*`. Envia ao Cloudinary (pasta `hcstore/produtos`) e salva a `secure_url` |
| `DELETE /produto-imagem/:id` | Remove o registro (não apaga o arquivo no Cloudinary) |

## Carrinho

- `Carrinho`: `id`, `usuarioId` (único: um carrinho por usuário), `createdAt`, `updatedAt`. `POST /carrinho` recebe `{ "usuarioId" }`.
- `ItemCarrinho`: `id`, `carrinhoId`, `produtoId`, `quantidade`, `updatedAt`. CRUD em `/itemcarrinho`.

O app mobile mantém a sacola em memória (contexto React) e só usa o checkout em `/pedidos/checkout`.

## Pedidos

`Pedido`: `id`, `usuarioId`, `enderecoId`, `status` (`PENDENTE` | `PAGO` | `ENVIADO` | `ENTREGUE` | `CANCELADO`), `total`, `frete`, `desconto`, `totalFinal`, `tipoEntrega`, `cupomCodigo`, `createdAt`, `updatedAt`.
`ItemPedido`: `id`, `pedidoId`, `produtoId`, `quantidade`, `preco` (preço no momento da compra), `updatedAt`.

### `POST /pedidos/checkout` (fluxo oficial de compra)
```json
{
  "enderecoId": 3,
  "items": [{ "produtoId": 12, "quantidade": 2 }],
  "tipoEntrega": "PADRAO",
  "cupomCodigo": "BEMVINDO10"
}
```
Tudo roda numa transação com `SELECT ... FOR UPDATE` nos produtos:

1. Itens repetidos são somados; quantidade precisa ser inteiro ≥ 1.
2. O endereço precisa pertencer ao usuário logado.
3. Produto inexistente, inativo ou com estoque insuficiente gera **400**.
4. O total usa o preço do banco, nunca o do cliente.
5. Se vier cupom, valida regras e uso prévio e calcula o desconto.
6. `frete` é fixo em `0`. `totalFinal = max(total + frete - desconto, 0)`.
7. Cria o pedido `PENDENTE`, grava os itens, baixa o estoque (se zerar, o produto fica `ativo = false`) e registra o uso do cupom.

**201** com o pedido e `itens`.

### Demais rotas
| Rota | Descrição |
|---|---|
| `GET /pedidos/meus` | Pedidos do usuário logado, mais recentes primeiro |
| `GET /pedidos` | Todos os pedidos, com usuário (sem senha) e endereço |
| `GET /pedidos/:id` | Um pedido com usuário e endereço |
| `POST /pedidos` | Criação manual (`usuarioId`, `enderecoId`, `total`, ...). Não valida estoque nem preços |
| `PATCH /pedidos/:id` | Altera `status`, `total`, `frete`, `desconto`, `totalFinal`, `tipoEntrega`, `cupomCodigo` |
| `DELETE /pedidos/:id` | Remove |

`/itempedido` expõe o CRUD dos itens (`GET`, `GET /:id`, `POST`, `PATCH /:id`, `DELETE /:id`).

## Pagamentos (PagBank)

### `POST /pagamentos/checkout` (JWT)
```json
{ "pedidoId": 41 }
```
**200** `{ "paymentUrl": "https://...", "pedidoId": 41 }`

Regras: o pedido precisa ser do usuário logado (senão **404**) e estar `PENDENTE` (senão **400**) e ter itens. Os valores saem dos itens do pedido e do `desconto` salvo (em centavos). Envia `reference_id = HCSTORE-PEDIDO-<id>`, `redirect_url = FRONTEND_URL/pagamento/sucesso` e `notification_urls` apontando para o webhook. **503** se `PAGBANK_TOKEN` não existir, se o PagBank recusar ou se não devolver o link `PAY`.

### `POST /pagamentos/webhook?token=<PAGBANK_WEBHOOK_TOKEN>`
Chamado pelo PagBank. O `token` é comparado em tempo constante; sem ele ou se for inválido, **401**. Lê `reference_id` e `status` (aceita vários formatos de payload). Referências que não começam com `HCSTORE-PEDIDO-` são ignoradas. Status `PAID`, `PAGO`, `AUTHORIZED` ou `APPROVED` movem o pedido de `PENDENTE` para `PAGO` (idempotente) e disparam o e-mail ao admin, quando o SMTP está configurado. Sempre responde `{ "received": true, "message": "..." }`.

## Cupons

`Cupom`: `id`, `codigo` (único, sempre maiúsculo), `tipo` (`PERCENTUAL` | `FIXO`), `valor`, `ativo`, `usoMaximo` (nulo = ilimitado), `usado`, `createdAt`, `updatedAt`. `CupomUso` impede que o mesmo usuário reutilize um cupom (único por `cupomId` + `usuarioId`).

| Rota | Acesso | Descrição |
|---|---|---|
| `POST /cupons/validar` | JWT | `{ "codigo", "subtotal" }` → `{ "cupomId", "codigo", "desconto" }` |
| `GET /cupons` | Admin | Lista, mais novos primeiro |
| `POST /cupons` | Admin | `{ "codigo", "tipo", "valor", "ativo"?, "usoMaximo"? }` |
| `DELETE /cupons/:id` | Admin | Exclui |

Desconto: `PERCENTUAL` = `subtotal × valor / 100`; `FIXO` = `valor`. Nunca passa do subtotal e é arredondado em 2 casas. Erros **400**: cupom inválido/inativo, limite de uso atingido, já usado por esta conta.

## Config do site

Conteúdo editável pelo painel (home e drops). Guardado como JSON na tabela `configsite` com a chave `site-config`.

- `GET /site-config` devolve o JSON salvo, ou um padrão com `home` (`videoUrl`, `banner1..3`, `destaques`, `lancamentos`) e `colecoes` (`bannerImagem`, `dropTitulo`, `dropSubtitulo`, `dropDescricao`, `dataLancamento`).
- `PUT /site-config` (Admin) substitui o JSON inteiro. Precisa ser um objeto (não array), senão **400**.

A tela **Drops** do app lê de `colecoes` para montar o contador e o texto do drop.

## Erros

Formato padrão do Nest:
```json
{ "statusCode": 400, "message": "Carrinho vazio.", "error": "Bad Request" }
```
Códigos usados: 400, 401, 403 (`Acesso restrito a administradores`), 404, 409, 503.
