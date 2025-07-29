export interface Item {
  id: string;
  nome: string;
  preco: number;
  precoPromocional?: number;
  promocaoAtiva?: boolean;
}

export interface ConfiguracaoInicial {
  ministerio: string;
  responsavel: string;
  items: Item[];
}

export interface ItemVenda extends Item {
  quantidade: number;
  precoPromocional?: number;
  desconto?: number;
}

export interface Venda {
  id: string;
  ministerio: string;
  responsavel: string;
  items: ItemVenda[];
  total: number;
  formaPagamento: 'PIX' | 'DINHEIRO' | 'CARTAO' | 'PAGAR_DEPOIS';
  nomePagador?: string; // Nome da pessoa quando for "pagar depois"
  dataHora: string;
}

export interface ResumoVendas {
  ministerio: string;
  responsavel: string;
  vendas: Venda[];
  totalGeral: number;
  totaisPorFormaPagamento: {
    PIX: number;
    DINHEIRO: number;
    CARTAO: number;
    PAGAR_DEPOIS: number;
  };
}