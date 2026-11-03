export class CreateProdutoDto {
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  categoriaId: number;

  marca?: string;
  tamanho?: string;
  composicaoMaterial?: string;
  instrucaoLavagem?: string;
  enviosDevolucoes?: string;
  quantidadePorTamanho?: string;
  ativo?: boolean;
}