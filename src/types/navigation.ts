import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Configuracao: undefined;
  Vendas: undefined;
  Resumo: undefined;
};

export type ConfiguracaoScreenProps = NativeStackScreenProps<RootStackParamList, 'Configuracao'>;
export type VendasScreenProps = NativeStackScreenProps<RootStackParamList, 'Vendas'>;
export type ResumoScreenProps = NativeStackScreenProps<RootStackParamList, 'Resumo'>;