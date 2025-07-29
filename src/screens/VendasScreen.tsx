import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Alert,
  TextInput,
  Platform,
} from 'react-native';
// import { useNavigation } from '@react-navigation/native';
import { ConfiguracaoInicial, Item, ItemVenda, Venda } from '../types/cantina';
import { StorageService } from '../services/storage';
import { fontSize, spacing, componentSize, isTablet, moderateScale, scale } from '../utils/responsive';
import { formatCurrency, parseCurrency } from '../utils/currency';
import { VendasScreenProps } from '../types/navigation';

export function VendasScreen({ navigation }: VendasScreenProps) {
  // const navigation = useNavigation<any>();
  const [configuracao, setConfiguracao] = useState<ConfiguracaoInicial | null>(null);
  const [carrinho, setCarrinho] = useState<{ [key: string]: ItemVenda }>({});
  const [modalPagamento, setModalPagamento] = useState(false);
  const [nomePagador, setNomePagador] = useState('');
  const [mostrarCampoNome, setMostrarCampoNome] = useState(false);
  const [modalPromocao, setModalPromocao] = useState(false);
  const [itemPromocao, setItemPromocao] = useState<string | null>(null);
  const [novoPreco, setNovoPreco] = useState('');
  const [modalPromocaoGeral, setModalPromocaoGeral] = useState(false);
  const [itemPromocaoGeral, setItemPromocaoGeral] = useState<Item | null>(null);
  const [precoPromocaoGeral, setPrecoPromocaoGeral] = useState('');
  const [promocoesGerais, setPromocoesGerais] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    carregarConfiguracao();
  }, []);

  const carregarConfiguracao = async () => {
    const config = await StorageService.obterConfiguracao();
    if (!config) {
      Alert.alert('Erro', 'Configuração não encontrada');
      navigation.goBack();
      return;
    }
    setConfiguracao(config);
  };

  const adicionarItem = (item: Item) => {
    const itemCarrinho = carrinho[item.id];
    if (itemCarrinho) {
      setCarrinho({
        ...carrinho,
        [item.id]: {
          ...itemCarrinho,
          quantidade: itemCarrinho.quantidade + 1
        }
      });
    } else {
      // Verifica se há promoção geral ativa
      const temPromocaoGeral = promocoesGerais[item.id];
      
      setCarrinho({
        ...carrinho,
        [item.id]: {
          ...item,
          quantidade: 1,
          // Se tem promoção geral, já adiciona com preço promocional
          ...(temPromocaoGeral && { precoPromocional: promocoesGerais[item.id] })
        }
      });
    }
  };

  const removerItem = (itemId: string) => {
    const itemCarrinho = carrinho[itemId];
    if (itemCarrinho && itemCarrinho.quantidade > 1) {
      setCarrinho({
        ...carrinho,
        [itemId]: {
          ...itemCarrinho,
          quantidade: itemCarrinho.quantidade - 1
        }
      });
    } else {
      const novoCarrinho = { ...carrinho };
      delete novoCarrinho[itemId];
      setCarrinho(novoCarrinho);
    }
  };

  const calcularTotal = () => {
    return Object.values(carrinho).reduce((total, item) => {
      const precoFinal = item.precoPromocional || item.preco;
      return total + (precoFinal * item.quantidade);
    }, 0);
  };

  const calcularDesconto = () => {
    return Object.values(carrinho).reduce((total, item) => {
      if (item.precoPromocional) {
        const desconto = (item.preco - item.precoPromocional) * item.quantidade;
        return total + desconto;
      }
      return total;
    }, 0);
  };

  const aplicarPromocao = () => {
    if (!itemPromocao || !novoPreco) return;
    
    const preco = parseCurrency(novoPreco);
    if (isNaN(preco) || preco <= 0) {
      Alert.alert('Atenção', 'Digite um preço válido');
      return;
    }
    
    const itemCarrinho = carrinho[itemPromocao];
    if (preco >= itemCarrinho.preco) {
      Alert.alert('Atenção', 'Preço promocional deve ser menor que o preço original');
      return;
    }
    
    setCarrinho({
      ...carrinho,
      [itemPromocao]: {
        ...itemCarrinho,
        precoPromocional: preco,
        desconto: itemCarrinho.preco - preco
      }
    });
    
    setModalPromocao(false);
    setItemPromocao(null);
    setNovoPreco('');
  };

  const aplicarPromocaoGeral = () => {
    if (!itemPromocaoGeral || !precoPromocaoGeral) return;
    
    const preco = parseCurrency(precoPromocaoGeral);
    if (isNaN(preco) || preco <= 0) {
      Alert.alert('Atenção', 'Digite um preço válido');
      return;
    }
    
    if (preco >= itemPromocaoGeral.preco) {
      Alert.alert('Atenção', 'Preço promocional deve ser menor que o preço original');
      return;
    }
    
    // Aplica promoção geral para o item
    setPromocoesGerais({
      ...promocoesGerais,
      [itemPromocaoGeral.id]: preco
    });
    
    // Atualiza itens no carrinho que já existem
    const carrinhoAtualizado = { ...carrinho };
    Object.keys(carrinhoAtualizado).forEach(itemId => {
      if (itemId === itemPromocaoGeral.id) {
        carrinhoAtualizado[itemId] = {
          ...carrinhoAtualizado[itemId],
          preco: preco
        };
      }
    });
    setCarrinho(carrinhoAtualizado);
    
    setModalPromocaoGeral(false);
    setItemPromocaoGeral(null);
    setPrecoPromocaoGeral('');
  };

  const removerPromocaoGeral = (itemId: string) => {
    const novasPromocoesGerais = { ...promocoesGerais };
    delete novasPromocoesGerais[itemId];
    setPromocoesGerais(novasPromocoesGerais);
    
    // Restaura preço original nos itens do carrinho
    const carrinhoAtualizado = { ...carrinho };
    const itemOriginal = configuracao?.items.find(i => i.id === itemId);
    if (itemOriginal) {
      Object.keys(carrinhoAtualizado).forEach(id => {
        if (id === itemId) {
          carrinhoAtualizado[id] = {
            ...carrinhoAtualizado[id],
            preco: itemOriginal.preco
          };
        }
      });
      setCarrinho(carrinhoAtualizado);
    }
  };

  const removerPromocao = (itemId: string) => {
    const itemCarrinho = carrinho[itemId];
    if (itemCarrinho && itemCarrinho.precoPromocional) {
      // Cria uma cópia do item sem as propriedades de promoção
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { precoPromocional, desconto, ...itemSemPromocao } = itemCarrinho;
      
      setCarrinho({
        ...carrinho,
        [itemId]: itemSemPromocao
      });
    }
  };

  const finalizarVenda = async (formaPagamento: 'PIX' | 'DINHEIRO' | 'CARTAO' | 'PAGAR_DEPOIS') => {
    console.log('Iniciando finalização de venda com forma de pagamento:', formaPagamento);
    try {
      if (Object.keys(carrinho).length === 0) {
        Alert.alert('Atenção', 'Carrinho vazio');
        return;
      }

      if (formaPagamento === 'PAGAR_DEPOIS' && !nomePagador.trim()) {
        Alert.alert('Atenção', 'Digite o nome da pessoa que vai pagar depois');
        return;
      }

      const venda: Venda = {
        id: Date.now().toString(),
        ministerio: configuracao!.ministerio,
        responsavel: configuracao!.responsavel,
        items: Object.values(carrinho),
        total: calcularTotal(),
        formaPagamento,
        nomePagador: formaPagamento === 'PAGAR_DEPOIS' ? nomePagador.trim() : undefined,
        dataHora: new Date().toISOString()
      };

      // Log temporário para debug
      if (Platform.OS === 'web') {
        const itensComPromocao = venda.items.filter(item => item.precoPromocional).length;
        const itensSemPromocao = venda.items.filter(item => !item.precoPromocional).length;
        console.log(`Salvando venda: ${itensComPromocao} com promoção, ${itensSemPromocao} sem promoção`);
      }

      console.log('Salvando venda:', venda);
      await StorageService.salvarVenda(venda);
      console.log('Venda salva com sucesso');
      
      setCarrinho({});
      setModalPagamento(false);
      setNomePagador('');
      setMostrarCampoNome(false);
      
      Alert.alert('Sucesso', 'Venda finalizada com sucesso!');
    } catch (error) {
      console.error('Erro ao finalizar venda:', error);
      Alert.alert('Erro', 'Não foi possível finalizar a venda. Tente novamente.');
    }
  };

  const abrirResumo = () => {
    navigation.navigate('Resumo');
  };

  if (!configuracao) {
    return (
      <View style={styles.container}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.ministerio}>{configuracao.ministerio}</Text>
          <Text style={styles.responsavel}>Caixa: {configuracao.responsavel}</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.botaoAlterar} onPress={() => navigation.navigate('Configuracao')}>
            <Text style={styles.textoBotaoHeader}>Alterar Itens</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.botaoResumo} onPress={abrirResumo}>
            <Text style={styles.textoBotaoHeader}>Resumo</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.conteudo}>
        <ScrollView 
          style={styles.listaItens} 
          contentContainerStyle={styles.listaItensContent}
          showsVerticalScrollIndicator={true}
          bounces={true}
          overScrollMode="always"
          scrollEventThrottle={16}
          decelerationRate="normal"
        >
          {configuracao.items.map(item => {
            const quantidade = carrinho[item.id]?.quantidade || 0;
            return (
              <View key={item.id} style={styles.itemContainer}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemNome}>{item.nome}</Text>
                  <View style={styles.precoContainer}>
                    {(carrinho[item.id]?.precoPromocional || promocoesGerais[item.id]) ? (
                      <>
                        <Text style={styles.itemPrecoOriginal}>R$ {item.preco.toFixed(2).replace('.', ',')}</Text>
                        <Text style={styles.itemPrecoPromocional}>
                          R$ {(carrinho[item.id]?.precoPromocional || promocoesGerais[item.id] || item.preco).toFixed(2).replace('.', ',')}
                        </Text>
                        <Text style={styles.promocaoTag}>PROMOÇÃO</Text>
                      </>
                    ) : (
                      <Text style={styles.itemPreco}>R$ {item.preco.toFixed(2).replace('.', ',')}</Text>
                    )}
                  </View>
                  <TouchableOpacity 
                    style={[styles.botaoPromocaoGeral, promocoesGerais[item.id] ? styles.botaoPromocaoGeralAtivo : undefined]}
                    onPress={() => {
                      if (promocoesGerais[item.id]) {
                        removerPromocaoGeral(item.id);
                      } else {
                        setItemPromocaoGeral(item);
                        setModalPromocaoGeral(true);
                      }
                    }}
                  >
                    <Text style={styles.textoBotaoPromocaoGeral}>
                      {promocoesGerais[item.id] ? 'Remover Promoção' : 'Promoção Geral'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.controleContainer}>
                  <View style={styles.controleQuantidade}>
                  <TouchableOpacity 
                    style={styles.botaoQuantidade} 
                    onPress={() => removerItem(item.id)}
                    disabled={quantidade === 0}
                  >
                    <Text style={styles.textoBotaoQuantidade}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.quantidade}>{quantidade}</Text>
                  <TouchableOpacity 
                    style={styles.botaoQuantidade} 
                    onPress={() => adicionarItem(item)}
                  >
                    <Text style={styles.textoBotaoQuantidade}>+</Text>
                  </TouchableOpacity>
                  </View>
                  {quantidade > 0 && (
                    <TouchableOpacity 
                      style={[styles.botaoPromocao, carrinho[item.id]?.precoPromocional ? styles.botaoPromocaoAtivo : undefined]}
                      onPress={() => {
                        if (carrinho[item.id]?.precoPromocional) {
                          removerPromocao(item.id);
                        } else {
                          setItemPromocao(item.id);
                          setModalPromocao(true);
                        }
                      }}
                    >
                      <Text style={styles.textoBotaoPromocao}>
                        {carrinho[item.id]?.precoPromocional ? 'Remover' : 'Promoção'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>

        {isTablet && (
          <View style={styles.lateralDireita}>
            <View style={styles.resumoContainer}>
              <Text style={styles.tituloResumo}>Resumo do Pedido</Text>
              <ScrollView 
                style={styles.resumoScroll}
                showsVerticalScrollIndicator={true}
              >
                {Object.values(carrinho).map(item => {
                  const totalComDesconto = (item.precoPromocional || item.preco) * item.quantidade;
                  const totalSemDesconto = item.preco * item.quantidade;
                  const temDesconto = item.precoPromocional && item.precoPromocional < item.preco;
                  
                  return (
                    <View key={item.id} style={styles.itemResumoContainer}>
                      <Text style={styles.itemResumoTexto}>
                        {item.quantidade}x {item.nome}
                      </Text>
                      {temDesconto ? (
                        <View style={styles.valoresContainer}>
                          <Text style={styles.itemResumoValorDesconto}>
                            c/ desconto: R$ {totalComDesconto.toFixed(2).replace('.', ',')}
                          </Text>
                          <Text style={styles.itemResumoValorOriginal}>
                            s/ desconto: R$ {totalSemDesconto.toFixed(2).replace('.', ',')}
                          </Text>
                        </View>
                      ) : (
                        <Text style={styles.itemResumoValor}>
                          R$ {totalComDesconto.toFixed(2).replace('.', ',')}
                        </Text>
                      )}
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        )}
      </View>

      <View style={styles.footerFixo}>
        {calcularDesconto() > 0 && (
          <View style={styles.descontoContainer}>
            <Text style={styles.descontoTexto}>Desconto aplicado:</Text>
            <Text style={styles.descontoValor}>
              - R$ {calcularDesconto().toFixed(2).replace('.', ',')}
            </Text>
          </View>
        )}
        <View style={styles.totalContainerFixo}>
          <Text style={styles.totalTexto}>TOTAL</Text>
          <Text style={styles.totalValor}>
            R$ {calcularTotal().toFixed(2).replace('.', ',')}
          </Text>
        </View>
        <TouchableOpacity 
          style={[styles.botaoFinalizarFixo, Object.keys(carrinho).length === 0 ? styles.botaoDesabilitado : undefined]} 
          onPress={() => setModalPagamento(true)}
          disabled={Object.keys(carrinho).length === 0}
        >
          <Text style={styles.textoBotaoFinalizar}>Finalizar Venda</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={modalPagamento}
        transparent
        animationType="slide"
        onRequestClose={() => setModalPagamento(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>Forma de Pagamento</Text>
            
            <TouchableOpacity 
              style={styles.botaoPagamento} 
              onPress={() => finalizarVenda('PIX')}
            >
              <Text style={styles.textoBotaoPagamento}>PIX</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.botaoPagamento} 
              onPress={() => finalizarVenda('DINHEIRO')}
            >
              <Text style={styles.textoBotaoPagamento}>DINHEIRO</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.botaoPagamento} 
              onPress={() => finalizarVenda('CARTAO')}
            >
              <Text style={styles.textoBotaoPagamento}>CARTÃO</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.botaoPagamento, styles.botaoPagarDepois]} 
              onPress={() => setMostrarCampoNome(true)}
            >
              <Text style={styles.textoBotaoPagamento}>PAGAR DEPOIS</Text>
            </TouchableOpacity>

            {mostrarCampoNome && (
              <View style={styles.campoNomeContainer}>
                <Text style={styles.labelNome}>Nome de quem vai pagar:</Text>
                <TextInput
                  style={styles.inputNome}
                  value={nomePagador}
                  onChangeText={setNomePagador}
                  placeholder="Digite o nome da pessoa"
                  placeholderTextColor="#999"
                  autoFocus
                />
                <TouchableOpacity 
                  style={[styles.botaoAdicionar, !nomePagador.trim() ? styles.botaoDesabilitado : undefined]}
                  onPress={() => finalizarVenda('PAGAR_DEPOIS')}
                  disabled={!nomePagador.trim()}
                >
                  <Text style={styles.textoBotaoAdicionar}>Adicionar</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity 
              style={styles.botaoCancelar} 
              onPress={() => {
                setModalPagamento(false);
                setMostrarCampoNome(false);
                setNomePagador('');
              }}
            >
              <Text style={styles.textoBotaoCancelar}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={modalPromocao}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setModalPromocao(false);
          setItemPromocao(null);
          setNovoPreco('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>Aplicar Promoção</Text>
            {itemPromocao && carrinho[itemPromocao] && (
              <>
                <Text style={styles.modalSubtitulo}>
                  {carrinho[itemPromocao].nome}
                </Text>
                <Text style={styles.modalPrecoOriginal}>
                  Preço original: R$ {carrinho[itemPromocao].preco.toFixed(2).replace('.', ',')}
                </Text>
                
                <Text style={styles.labelPromocao}>Novo preço (R$):</Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.currencySymbol}>R$</Text>
                  <TextInput
                    style={styles.inputWithSymbol}
                    value={novoPreco}
                    onChangeText={(text) => setNovoPreco(formatCurrency(text))}
                    placeholder="0,00"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    autoFocus
                  />
                </View>
                
                <TouchableOpacity 
                  style={styles.botaoAplicar} 
                  onPress={aplicarPromocao}
                >
                  <Text style={styles.textoBotaoAplicar}>Aplicar Promoção</Text>
                </TouchableOpacity>
              </>
            )}
            
            <TouchableOpacity 
              style={styles.botaoCancelar} 
              onPress={() => {
                setModalPromocao(false);
                setItemPromocao(null);
                setNovoPreco('');
              }}
            >
              <Text style={styles.textoBotaoCancelar}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={modalPromocaoGeral}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setModalPromocaoGeral(false);
          setItemPromocaoGeral(null);
          setPrecoPromocaoGeral('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>Promoção Geral</Text>
            {itemPromocaoGeral && (
              <>
                <Text style={styles.modalSubtitulo}>
                  {itemPromocaoGeral.nome}
                </Text>
                <Text style={styles.modalInfo}>
                  Esta promoção será aplicada para todas as vendas futuras deste item até ser desativada.
                </Text>
                <Text style={styles.modalPrecoOriginal}>
                  Preço original: R$ {itemPromocaoGeral.preco.toFixed(2).replace('.', ',')}
                </Text>
                
                <Text style={styles.labelPromocao}>Novo preço (R$):</Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.currencySymbol}>R$</Text>
                  <TextInput
                    style={styles.inputWithSymbol}
                    value={precoPromocaoGeral}
                    onChangeText={(text) => setPrecoPromocaoGeral(formatCurrency(text))}
                    placeholder="0,00"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    autoFocus
                  />
                </View>
                
                <TouchableOpacity 
                  style={styles.botaoAplicar} 
                  onPress={aplicarPromocaoGeral}
                >
                  <Text style={styles.textoBotaoAplicar}>Aplicar Promoção Geral</Text>
                </TouchableOpacity>
              </>
            )}
            
            <TouchableOpacity 
              style={styles.botaoCancelar} 
              onPress={() => {
                setModalPromocaoGeral(false);
                setItemPromocaoGeral(null);
                setPrecoPromocaoGeral('');
              }}
            >
              <Text style={styles.textoBotaoCancelar}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: spacing.large,
    paddingTop: spacing.huge,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    marginRight: spacing.regular,
  },
  ministerio: {
    color: '#fff',
    fontSize: fontSize.xlarge,
    fontWeight: 'bold',
  },
  responsavel: {
    color: '#fff',
    fontSize: fontSize.medium,
    marginTop: spacing.tiny,
  },
  botaoResumo: {
    backgroundColor: '#1976D2',
    paddingHorizontal: spacing.large,
    paddingVertical: spacing.regular,
    borderRadius: moderateScale(8),
  },
  textoBotaoResumo: {
    color: '#fff',
    fontSize: fontSize.medium,
    fontWeight: '600',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: spacing.small,
  },
  botaoAlterar: {
    backgroundColor: '#FF9800',
    paddingHorizontal: spacing.large,
    paddingVertical: spacing.regular,
    borderRadius: moderateScale(8),
  },
  textoBotaoHeader: {
    color: '#fff',
    fontSize: fontSize.medium,
    fontWeight: '600',
  },
  conteudo: {
    flex: 1,
    flexDirection: 'row',
    marginBottom: scale(120), // Espaço maior para o footer fixo
  },
  listaItens: {
    flex: isTablet ? 2 : 1,
    backgroundColor: '#f5f5f5',
  },
  listaItensContent: {
    flexGrow: 1,
    paddingTop: spacing.large,
    paddingHorizontal: spacing.large,
    paddingBottom: spacing.huge * 2, // Padding extra no final
  },
  itemContainer: {
    backgroundColor: '#fff',
    padding: spacing.medium,
    borderRadius: moderateScale(8),
    marginBottom: spacing.regular,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemInfo: {
    flex: 1,
  },
  itemNome: {
    fontSize: fontSize.large,
    fontWeight: '600',
    color: '#333',
  },
  itemPreco: {
    fontSize: fontSize.medium,
    color: '#666',
    marginTop: spacing.tiny,
  },
  precoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.tiny,
  },
  itemPrecoOriginal: {
    fontSize: fontSize.medium,
    color: '#999',
    textDecorationLine: 'line-through',
    marginRight: spacing.small,
  },
  itemPrecoPromocional: {
    fontSize: fontSize.medium,
    color: '#e74c3c',
    fontWeight: '700',
  },
  controleContainer: {
    alignItems: 'center',
  },
  controleQuantidade: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  botaoPromocao: {
    backgroundColor: '#f39c12',
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
    borderRadius: moderateScale(6),
    marginTop: spacing.small,
  },
  botaoPromocaoAtivo: {
    backgroundColor: '#e74c3c',
  },
  textoBotaoPromocao: {
    color: '#fff',
    fontSize: fontSize.small,
    fontWeight: '600',
  },
  botaoPromocaoGeral: {
    backgroundColor: '#8e44ad',
    paddingHorizontal: spacing.small,
    paddingVertical: spacing.tiny,
    borderRadius: moderateScale(4),
    marginTop: spacing.tiny,
  },
  botaoPromocaoGeralAtivo: {
    backgroundColor: '#e74c3c',
  },
  textoBotaoPromocaoGeral: {
    color: '#fff',
    fontSize: fontSize.tiny,
    fontWeight: '600',
  },
  botaoQuantidade: {
    backgroundColor: '#2196F3',
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoBotaoQuantidade: {
    color: '#fff',
    fontSize: fontSize.xxlarge,
    fontWeight: 'bold',
  },
  quantidade: {
    fontSize: fontSize.xlarge,
    fontWeight: 'bold',
    marginHorizontal: spacing.medium,
    minWidth: scale(30),
    textAlign: 'center',
  },
  lateralDireita: {
    flex: 1,
    backgroundColor: '#fff',
    padding: spacing.large,
    borderLeftWidth: 1,
    borderLeftColor: '#e0e0e0',
  },
  resumoContainer: {
    flex: 1,
  },
  resumoScroll: {
    flex: 1,
  },
  tituloResumo: {
    fontSize: fontSize.xlarge,
    fontWeight: 'bold',
    marginBottom: spacing.large,
    color: '#333',
  },
  itemResumo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.regular,
  },
  itemResumoContainer: {
    marginBottom: spacing.medium,
    paddingBottom: spacing.small,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemResumoTexto: {
    fontSize: fontSize.medium,
    color: '#333',
    fontWeight: '600',
    marginBottom: spacing.tiny,
  },
  itemResumoValor: {
    fontSize: fontSize.medium,
    color: '#333',
  },
  valoresContainer: {
    marginLeft: spacing.regular,
  },
  itemResumoValorDesconto: {
    fontSize: fontSize.small,
    color: '#27ae60',
    fontWeight: '600',
  },
  itemResumoValorOriginal: {
    fontSize: fontSize.small,
    color: '#999',
    marginTop: spacing.tiny,
  },
  footerFixo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: spacing.large,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
  },
  descontoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.small,
    paddingBottom: spacing.small,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  descontoTexto: {
    fontSize: fontSize.medium,
    color: '#e74c3c',
  },
  descontoValor: {
    fontSize: fontSize.medium,
    color: '#e74c3c',
    fontWeight: '600',
  },
  totalContainerFixo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.medium,
    paddingBottom: spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  totalTexto: {
    fontSize: fontSize.xlarge,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValor: {
    fontSize: fontSize.xxlarge,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  botaoFinalizarFixo: {
    backgroundColor: '#4CAF50',
    padding: spacing.large,
    borderRadius: moderateScale(12),
    alignItems: 'center',
    height: componentSize.buttonHeight,
    justifyContent: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  botaoDesabilitado: {
    backgroundColor: '#ccc',
  },
  textoBotaoFinalizar: {
    color: '#fff',
    fontSize: fontSize.large,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: spacing.xlarge,
    borderRadius: moderateScale(15),
    width: '80%',
    maxWidth: scale(400),
  },
  modalTitulo: {
    fontSize: fontSize.xxlarge,
    fontWeight: 'bold',
    marginBottom: spacing.xlarge,
    textAlign: 'center',
    color: '#333',
  },
  botaoPagamento: {
    backgroundColor: '#2196F3',
    padding: spacing.large,
    borderRadius: moderateScale(10),
    marginBottom: spacing.medium,
    alignItems: 'center',
    height: componentSize.buttonHeight,
    justifyContent: 'center',
  },
  textoBotaoPagamento: {
    color: '#fff',
    fontSize: fontSize.large,
    fontWeight: '600',
  },
  botaoCancelar: {
    backgroundColor: '#f44336',
    padding: spacing.large,
    borderRadius: moderateScale(10),
    marginTop: spacing.regular,
    alignItems: 'center',
    height: componentSize.buttonHeight,
    justifyContent: 'center',
  },
  textoBotaoCancelar: {
    color: '#fff',
    fontSize: fontSize.large,
    fontWeight: '600',
  },
  modalSubtitulo: {
    fontSize: fontSize.large,
    color: '#333',
    textAlign: 'center',
    marginBottom: spacing.small,
    fontWeight: '600',
  },
  modalInfo: {
    fontSize: fontSize.regular,
    color: '#666',
    textAlign: 'center',
    marginBottom: spacing.medium,
    paddingHorizontal: spacing.medium,
  },
  modalPrecoOriginal: {
    fontSize: fontSize.medium,
    color: '#666',
    textAlign: 'center',
    marginBottom: spacing.large,
  },
  labelPromocao: {
    fontSize: fontSize.medium,
    color: '#5a6c7d',
    marginBottom: spacing.small,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e1e8ed',
    borderRadius: moderateScale(12),
    backgroundColor: '#fff',
    marginBottom: spacing.medium,
    height: componentSize.inputHeight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  currencySymbol: {
    fontSize: fontSize.medium,
    color: '#5a6c7d',
    fontWeight: '600',
    paddingLeft: spacing.regular,
    paddingRight: spacing.small,
  },
  inputWithSymbol: {
    flex: 1,
    fontSize: fontSize.medium,
    padding: spacing.regular,
    paddingLeft: 0,
    height: '100%',
  },
  botaoAplicar: {
    backgroundColor: '#27ae60',
    padding: spacing.large,
    borderRadius: moderateScale(10),
    marginBottom: spacing.medium,
    alignItems: 'center',
    height: componentSize.buttonHeight,
    justifyContent: 'center',
  },
  textoBotaoAplicar: {
    color: '#fff',
    fontSize: fontSize.large,
    fontWeight: '600',
  },
  botaoPagarDepois: {
    backgroundColor: '#FF9800',
  },
  campoNomeContainer: {
    marginVertical: spacing.medium,
  },
  labelNome: {
    fontSize: fontSize.medium,
    color: '#333',
    marginBottom: spacing.small,
  },
  inputNome: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: moderateScale(8),
    padding: spacing.regular,
    fontSize: fontSize.medium,
    backgroundColor: '#fafafa',
    marginBottom: spacing.regular,
    height: componentSize.inputHeight,
  },
  botaoAdicionar: {
    backgroundColor: '#4CAF50',
    padding: spacing.medium,
    borderRadius: moderateScale(8),
    alignItems: 'center',
    height: componentSize.buttonHeight,
    justifyContent: 'center',
  },
  textoBotaoAdicionar: {
    color: '#fff',
    fontSize: fontSize.medium,
    fontWeight: '600',
  },
  promocaoTag: {
    backgroundColor: '#e74c3c',
    color: '#fff',
    fontSize: fontSize.tiny,
    paddingHorizontal: spacing.small,
    paddingVertical: spacing.tiny,
    borderRadius: moderateScale(4),
    marginLeft: spacing.small,
    fontWeight: 'bold',
  },
});