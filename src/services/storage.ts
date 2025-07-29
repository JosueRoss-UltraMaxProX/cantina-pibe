import AsyncStorage from '@react-native-async-storage/async-storage';
import { ConfiguracaoInicial, Venda, ItemVenda } from '../types/cantina';

const STORAGE_KEYS = {
  CONFIGURACAO_ATUAL: '@cantina_configuracao_atual',
  VENDAS: '@cantina_vendas',
  CARRINHO: '@cantina_carrinho'
};

export class StorageService {
  static async salvarConfiguracao(config: ConfiguracaoInicial): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CONFIGURACAO_ATUAL, JSON.stringify(config));
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
    }
  }

  static async obterConfiguracao(): Promise<ConfiguracaoInicial | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CONFIGURACAO_ATUAL);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Erro ao obter configuração:', error);
      return null;
    }
  }

  static async salvarVenda(venda: Venda): Promise<void> {
    try {
      const vendasExistentes = await this.obterVendas();
      vendasExistentes.push(venda);
      await AsyncStorage.setItem(STORAGE_KEYS.VENDAS, JSON.stringify(vendasExistentes));
    } catch (error) {
      console.error('Erro ao salvar venda:', error);
      throw error;
    }
  }

  static async obterVendas(): Promise<Venda[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.VENDAS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Erro ao obter vendas:', error);
      return [];
    }
  }

  static async limparCantina(): Promise<void> {
    try {
      console.log('Limpando cantina...');
      await AsyncStorage.removeItem(STORAGE_KEYS.CONFIGURACAO_ATUAL);
      await AsyncStorage.removeItem(STORAGE_KEYS.VENDAS);
      await AsyncStorage.removeItem(STORAGE_KEYS.CARRINHO);
      console.log('Cantina limpa com sucesso');
    } catch (error) {
      console.error('Erro ao limpar cantina:', error);
      throw error;
    }
  }

  static async salvarCarrinho(carrinho: { [key: string]: ItemVenda }): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CARRINHO, JSON.stringify(carrinho));
    } catch (error) {
      console.error('Erro ao salvar carrinho:', error);
    }
  }

  static async obterCarrinho(): Promise<{ [key: string]: ItemVenda }> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CARRINHO);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Erro ao obter carrinho:', error);
      return {};
    }
  }

  static async removerVenda(vendaId: string): Promise<void> {
    try {
      const vendas = await this.obterVendas();
      const vendasAtualizadas = vendas.filter(v => v.id !== vendaId);
      await AsyncStorage.setItem(STORAGE_KEYS.VENDAS, JSON.stringify(vendasAtualizadas));
    } catch (error) {
      console.error('Erro ao remover venda:', error);
      throw error;
    }
  }

  static async salvarVendasAtualizadas(vendas: Venda[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.VENDAS, JSON.stringify(vendas));
    } catch (error) {
      console.error('Erro ao salvar vendas atualizadas:', error);
      throw error;
    }
  }
}