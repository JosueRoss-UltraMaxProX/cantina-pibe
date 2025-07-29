import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  Modal,
  SafeAreaView,
} from 'react-native';
// import { useNavigation } from '@react-navigation/native';
import { Venda, ResumoVendas } from '../types/cantina';
import { StorageService } from '../services/storage';
import { PDFService } from '../services/pdfService';
import { fontSize, spacing, componentSize, isTablet, moderateScale, scale } from '../utils/responsive';
import { PrintWrapper } from '../components/PrintWrapper';
import { ResumoScreenProps } from '../types/navigation';

export function ResumoScreen({ navigation }: ResumoScreenProps) {
  // const navigation = useNavigation();
  const [resumo, setResumo] = useState<ResumoVendas | null>(null);
  const [modalPagamento, setModalPagamento] = useState(false);
  const [vendaSelecionada, setVendaSelecionada] = useState<Venda | null>(null);

  useEffect(() => {
    carregarResumo();
  }, []);

  const carregarResumo = async () => {
    const config = await StorageService.obterConfiguracao();
    const vendas = await StorageService.obterVendas();

    if (!config) {
      Alert.alert('Erro', 'Configuração não encontrada');
      navigation.goBack();
      return;
    }

    const totaisPorFormaPagamento = {
      PIX: 0,
      DINHEIRO: 0,
      CARTAO: 0,
      PAGAR_DEPOIS: 0
    };

    let totalGeral = 0;

    vendas.forEach(venda => {
      totalGeral += venda.total;
      totaisPorFormaPagamento[venda.formaPagamento] += venda.total;
    });

    setResumo({
      ministerio: config.ministerio,
      responsavel: config.responsavel,
      vendas,
      totalGeral,
      totaisPorFormaPagamento
    });
  };

  const limparCantina = () => {
    if (Platform.OS === 'web') {
      // Para web, usar confirm nativo
      const confirmacao = window.confirm('Isso irá apagar todas as vendas e configurações. Deseja continuar?');
      if (confirmacao) {
        limparTudo();
      }
    } else {
      // Para mobile, usar Alert do React Native
      Alert.alert(
        'Limpar Cantina',
        'Isso irá apagar todas as vendas e configurações. Deseja continuar?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Limpar',
            style: 'destructive',
            onPress: limparTudo
          }
        ]
      );
    }
  };

  const limparTudo = async () => {
    try {
      await StorageService.limparCantina();
      // Navegar para a tela inicial (Configuração)
      navigation.navigate('Configuracao');
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
      Alert.alert('Erro', 'Não foi possível limpar os dados');
    }
  };

  const gerarPDF = async () => {
    if (!resumo) return;
    
    try {
      if (Platform.OS === 'web') {
        // Criar conteúdo HTML para impressão
        const printContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <title>Resumo de Vendas - ${resumo.ministerio}</title>
            <style>
              body {
                font-family: 'Courier New', monospace;
                font-size: 12px;
                line-height: 1.4;
                margin: 20px;
                max-width: 300px;
              }
              .header { text-align: center; font-weight: bold; margin-bottom: 10px; }
              .divider { border-bottom: 1px dashed #000; margin: 10px 0; }
              .section { margin: 10px 0; }
              .total { font-size: 14px; font-weight: bold; margin: 10px 0; }
              .item { margin: 2px 0; }
              .center { text-align: center; }
              .small { font-size: 10px; }
            </style>
          </head>
          <body>
            <div class="header">
              ${resumo.ministerio}<br>
              <span class="small">Responsável: ${resumo.responsavel}</span>
            </div>
            
            <div class="divider"></div>
            
            <div class="center">
              <strong>RESUMO DE VENDAS</strong><br>
              <span class="small">${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}</span>
            </div>
            
            <div class="divider"></div>
            
            <div class="section">
              <div class="item">PIX.............. R$ ${resumo.totaisPorFormaPagamento.PIX.toFixed(2).replace('.', ',')}</div>
              <div class="item">DINHEIRO......... R$ ${resumo.totaisPorFormaPagamento.DINHEIRO.toFixed(2).replace('.', ',')}</div>
              <div class="item">CARTÃO........... R$ ${resumo.totaisPorFormaPagamento.CARTAO.toFixed(2).replace('.', ',')}</div>
              <div class="item">PAGAR DEPOIS..... R$ ${resumo.totaisPorFormaPagamento.PAGAR_DEPOIS.toFixed(2).replace('.', ',')}</div>
            </div>
            
            ${vendasPorTipo.PAGAR_DEPOIS.length > 0 ? `
            <div class="section" style="margin-top: 10px; font-size: 11pt;">
              <strong>PAGAR DEPOIS - DETALHES:</strong>
              ${vendasPorTipo.PAGAR_DEPOIS.map(venda => 
                `<div class="item" style="margin-left: 10px;">• ${venda.nomePagador}: R$ ${venda.total.toFixed(2).replace('.', ',')}</div>`
              ).join('')}
            </div>
            ` : ''}
            
            <div class="divider"></div>
            
            <div class="total">
              TOTAL GERAL: R$ ${resumo.totalGeral.toFixed(2).replace('.', ',')}
            </div>
            
            <div class="divider"></div>
            
            <div class="section">
              <strong>ITENS VENDIDOS:</strong>
              ${Object.entries(totalizadorItens || {})
                .sort(([, a], [, b]) => b - a)
                .map(([nome, qtd]) => {
                  const nomeStr = String(nome || '');
                  const qtdStr = String(qtd || 0);
                  const dots = '.'.repeat(Math.max(0, 25 - nomeStr.length));
                  return `<div class="item">${nomeStr}${dots} ${qtdStr}un</div>`;
                })
                .join('')}
            </div>
            
            ${totaisPromocao.quantidadeComPromocao > 0 || totaisPromocao.quantidadeSemPromocao > 0 ? `
              <div class="divider"></div>
              <div class="section">
                <strong>ANÁLISE DE PROMOÇÕES:</strong>
                <div class="item">Com promoção..... ${totaisPromocao.quantidadeComPromocao}un</div>
                <div class="item">Sem promoção..... ${totaisPromocao.quantidadeSemPromocao}un</div>
                <div class="item">Total c/ desc.... R$ ${totaisPromocao.totalComPromocao.toFixed(2).replace('.', ',')}</div>
                <div class="item">Total s/ desc.... R$ ${totaisPromocao.totalSemPromocao.toFixed(2).replace('.', ',')}</div>
              </div>
            ` : ''}
            
            <div class="divider"></div>
            
            <div class="center small">
              Total de vendas: ${resumo.vendas.length}
            </div>
          </body>
          </html>
        `;
        
        // Abrir nova janela para impressão
        const printWindow = window.open('', 'PRINT', 'height=600,width=400');
        
        if (printWindow) {
          printWindow.document.open();
          printWindow.document.write(printContent);
          printWindow.document.close();
          
          // Aguardar o carregamento completo antes de imprimir
          printWindow.onload = function() {
            setTimeout(() => {
              printWindow.focus();
              printWindow.print();
              // Não fechar automaticamente, deixar o usuário fechar
              // printWindow.close();
            }, 100);
          };
        } else {
          Alert.alert('Erro', 'Não foi possível abrir a janela de impressão. Verifique se pop-ups estão bloqueados.');
        }
      } else {
        // Para mobile, manter o comportamento original
        await PDFService.gerarPDFResumo(resumo);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível gerar o PDF');
    }
  };

  const formatarData = (dataISO: string) => {
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR');
  };

  const abrirModalPagamento = (venda: Venda) => {
    setVendaSelecionada(venda);
    setModalPagamento(true);
  };

  const marcarComoPago = async (formaPagamento: 'PIX' | 'DINHEIRO' | 'CARTAO') => {
    if (!vendaSelecionada) return;
    
    try {
      // Atualizar a forma de pagamento da venda
      const vendasAtualizadas = resumo!.vendas.map(venda => 
        venda.id === vendaSelecionada.id 
          ? { ...venda, formaPagamento } 
          : venda
      );
      
      // Salvar as vendas atualizadas
      await StorageService.salvarVendasAtualizadas(vendasAtualizadas);
      
      setModalPagamento(false);
      setVendaSelecionada(null);
      
      // Recarregar resumo
      carregarResumo();
      
      Alert.alert('Sucesso', 'Pagamento registrado com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível registrar o pagamento');
    }
  };


  // Separar vendas por tipo de pagamento
  const vendasPorTipo = {
    PIX: resumo?.vendas.filter(v => v.formaPagamento === 'PIX') || [],
    DINHEIRO: resumo?.vendas.filter(v => v.formaPagamento === 'DINHEIRO') || [],
    CARTAO: resumo?.vendas.filter(v => v.formaPagamento === 'CARTAO') || [],
    PAGAR_DEPOIS: resumo?.vendas.filter(v => v.formaPagamento === 'PAGAR_DEPOIS') || []
  };

  // Calcular totalizador de itens vendidos
  const calcularTotalizadorItens = () => {
    if (!resumo) return {};
    
    const totalizador: { [key: string]: number } = {};
    
    resumo.vendas.forEach(venda => {
      venda.items.forEach(item => {
        if (totalizador[item.nome]) {
          totalizador[item.nome] += item.quantidade;
        } else {
          totalizador[item.nome] = item.quantidade;
        }
      });
    });
    
    return totalizador;
  };

  // Calcular totais com e sem promoção
  const calcularTotaisPromocao = () => {
    let totalComPromocao = 0;
    let totalSemPromocao = 0;
    let quantidadeComPromocao = 0;
    let quantidadeSemPromocao = 0;
    let economiaTotal = 0;

    resumo?.vendas.forEach(venda => {
      venda.items.forEach(item => {
        if (item.precoPromocional) {
          // Item vendido com promoção
          totalComPromocao += item.precoPromocional * item.quantidade;
          quantidadeComPromocao += item.quantidade;
          // Calcular quanto seria sem promoção
          economiaTotal += (item.preco - item.precoPromocional) * item.quantidade;
        } else {
          // Item vendido sem promoção
          totalSemPromocao += item.preco * item.quantidade;
          quantidadeSemPromocao += item.quantidade;
        }
      });
    });

    return {
      totalComPromocao,
      totalSemPromocao,
      quantidadeComPromocao,
      quantidadeSemPromocao,
      economiaTotal
    };
  };

  const totalizadorItens = calcularTotalizadorItens();
  const totaisPromocao = calcularTotaisPromocao();

  if (!resumo) {
    return (
      <View style={styles.container}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <PrintWrapper hideOnPrint>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.botaoVoltar}>←</Text>
          </TouchableOpacity>
          <Text style={styles.titulo}>Resumo de Vendas</Text>
          <TouchableOpacity style={styles.botaoLimpar} onPress={limparCantina}>
            <Text style={styles.textoBotaoLimpar}>Limpar Cantina</Text>
          </TouchableOpacity>
        </View>
      </PrintWrapper>

      <ScrollView 
        style={styles.conteudo}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.scrollContent}
        bounces={true}
        overScrollMode="always"
        scrollEventThrottle={16}
        decelerationRate="normal"
      >
        <View style={styles.infoContainer}>
          <Text style={styles.ministerio}>{resumo.ministerio}</Text>
          <Text style={styles.responsavel}>Responsável: {resumo.responsavel}</Text>
          <PrintWrapper showOnlyOnPrint>
            <Text style={styles.dataImpressao}>
              Impresso em: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}
            </Text>
          </PrintWrapper>
        </View>

        <View style={styles.resumoGeral}>
          <Text style={styles.subtitulo}>Resumo por Forma de Pagamento</Text>
          
          <View style={styles.formaPagamento}>
            <Text style={styles.formaPagamentoTexto}>PIX:</Text>
            <Text style={styles.formaPagamentoValor}>
              R$ {resumo.totaisPorFormaPagamento.PIX.toFixed(2).replace('.', ',')}
            </Text>
          </View>

          <View style={styles.formaPagamento}>
            <Text style={styles.formaPagamentoTexto}>DINHEIRO:</Text>
            <Text style={styles.formaPagamentoValor}>
              R$ {resumo.totaisPorFormaPagamento.DINHEIRO.toFixed(2).replace('.', ',')}
            </Text>
          </View>

          <View style={styles.formaPagamento}>
            <Text style={styles.formaPagamentoTexto}>CARTÃO:</Text>
            <Text style={styles.formaPagamentoValor}>
              R$ {resumo.totaisPorFormaPagamento.CARTAO.toFixed(2).replace('.', ',')}
            </Text>
          </View>

          <View style={styles.formaPagamento}>
            <Text style={styles.formaPagamentoTexto}>PAGAR DEPOIS:</Text>
            <Text style={styles.formaPagamentoValor}>
              R$ {resumo.totaisPorFormaPagamento.PAGAR_DEPOIS.toFixed(2).replace('.', ',')}
            </Text>
          </View>

          {/* Lista de pessoas que vão pagar depois */}
          {vendasPorTipo.PAGAR_DEPOIS.length > 0 && (
            <View style={styles.listaPagarDepois}>
              <Text style={styles.listaPagarDepoisTitulo}>Pessoas que vão pagar depois:</Text>
              {vendasPorTipo.PAGAR_DEPOIS.map((venda) => (
                <Text key={venda.id} style={styles.listaPagarDepoisNome}>
                  • {venda.nomePagador}: R$ {venda.total.toFixed(2).replace('.', ',')}
                </Text>
              ))}
            </View>
          )}

          <View style={styles.totalGeral}>
            <Text style={styles.totalGeralTexto}>TOTAL GERAL:</Text>
            <Text style={styles.totalGeralValor}>
              R$ {resumo.totalGeral.toFixed(2).replace('.', ',')}
            </Text>
          </View>
        </View>

        {/* Vendas Pagar Depois */}
        {vendasPorTipo.PAGAR_DEPOIS.length > 0 && (
          <View style={styles.listaVendas}>
            <Text style={styles.subtitulo}>Vendas - Pagar Depois ({vendasPorTipo.PAGAR_DEPOIS.length})</Text>
            
            {vendasPorTipo.PAGAR_DEPOIS.map((venda) => (
              <View key={venda.id} style={styles.vendaItem}>
                <View style={styles.vendaHeader}>
                  <Text style={styles.vendaNome}>{venda.nomePagador}</Text>
                  <TouchableOpacity 
                    style={styles.botaoPago}
                    onPress={() => abrirModalPagamento(venda)}
                  >
                    <Text style={styles.textoBotaoPago}>Pago</Text>
                  </TouchableOpacity>
                </View>
                
                {venda.items.map(item => (
                  <Text key={item.id} style={styles.vendaItemTexto}>
                    {item.quantidade}x {item.nome} - R$ {(item.preco * item.quantidade).toFixed(2).replace('.', ',')}
                  </Text>
                ))}
                
                <View style={styles.vendaFooter}>
                  <Text style={styles.vendaData}>{formatarData(venda.dataHora)}</Text>
                  <Text style={styles.vendaTotal}>
                    Total: R$ {venda.total.toFixed(2).replace('.', ',')}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Outras Vendas */}
        <View style={styles.listaVendas}>
          <Text style={styles.subtitulo}>Vendas Finalizadas</Text>
          
          {/* PIX */}
          {vendasPorTipo.PIX.length > 0 && (
            <>
              <Text style={styles.subtituloTipo}>PIX ({vendasPorTipo.PIX.length})</Text>
              {vendasPorTipo.PIX.map((venda) => (
                <View key={venda.id} style={styles.vendaItemCompacto}>
                  <Text style={styles.vendaResumo}>
                    {venda.items.map(item => `${item.quantidade}x ${item.nome}`).join(', ')}
                  </Text>
                  <Text style={styles.vendaValor}>R$ {venda.total.toFixed(2).replace('.', ',')}</Text>
                </View>
              ))}
            </>
          )}

          {/* DINHEIRO */}
          {vendasPorTipo.DINHEIRO.length > 0 && (
            <>
              <Text style={styles.subtituloTipo}>DINHEIRO ({vendasPorTipo.DINHEIRO.length})</Text>
              {vendasPorTipo.DINHEIRO.map((venda) => (
                <View key={venda.id} style={styles.vendaItemCompacto}>
                  <Text style={styles.vendaResumo}>
                    {venda.items.map(item => `${item.quantidade}x ${item.nome}`).join(', ')}
                  </Text>
                  <Text style={styles.vendaValor}>R$ {venda.total.toFixed(2).replace('.', ',')}</Text>
                </View>
              ))}
            </>
          )}

          {/* CARTÃO */}
          {vendasPorTipo.CARTAO.length > 0 && (
            <>
              <Text style={styles.subtituloTipo}>CARTÃO ({vendasPorTipo.CARTAO.length})</Text>
              {vendasPorTipo.CARTAO.map((venda) => (
                <View key={venda.id} style={styles.vendaItemCompacto}>
                  <Text style={styles.vendaResumo}>
                    {venda.items.map(item => `${item.quantidade}x ${item.nome}`).join(', ')}
                  </Text>
                  <Text style={styles.vendaValor}>R$ {venda.total.toFixed(2).replace('.', ',')}</Text>
                </View>
              ))}
            </>
          )}
        </View>

        {/* Totalizador de Itens Vendidos */}
        {Object.keys(totalizadorItens).length > 0 && (
          <View style={styles.totalizadorContainer}>
            <Text style={styles.subtitulo}>Total de Itens Vendidos</Text>
            
            {Object.entries(totalizadorItens)
              .sort(([, a], [, b]) => b - a) // Ordenar por quantidade (maior primeiro)
              .map(([nomeItem, quantidade]) => (
                <View key={nomeItem} style={styles.totalizadorItem}>
                  <Text style={styles.totalizadorItemNome}>{nomeItem}</Text>
                  <Text style={styles.totalizadorItemQuantidade}>{quantidade} unidades</Text>
                </View>
              ))
            }
            
            <View style={styles.totalizadorTotal}>
              <Text style={styles.totalizadorTotalTexto}>Total Geral de Itens:</Text>
              <Text style={styles.totalizadorTotalValor}>
                {Object.values(totalizadorItens).reduce((total, qtd) => total + qtd, 0)} unidades
              </Text>
            </View>
          </View>
        )}

        {/* Análise de Promoções */}
        {(totaisPromocao.quantidadeComPromocao > 0 || totaisPromocao.quantidadeSemPromocao > 0) && (
          <View style={styles.promocaoContainer}>
            <Text style={styles.subtitulo}>Análise de Promoções</Text>
            
            <View style={styles.promocaoItem}>
              <Text style={styles.promocaoTexto}>Itens vendidos com promoção:</Text>
              <Text style={styles.promocaoValor}>{totaisPromocao.quantidadeComPromocao} un</Text>
            </View>
            
            <View style={styles.promocaoItem}>
              <Text style={styles.promocaoTexto}>Itens vendidos sem promoção:</Text>
              <Text style={styles.promocaoValor}>{totaisPromocao.quantidadeSemPromocao} un</Text>
            </View>
            
            <View style={styles.promocaoItem}>
              <Text style={styles.promocaoTexto}>Total arrecadado c/ desconto:</Text>
              <Text style={styles.promocaoValor}>R$ {totaisPromocao.totalComPromocao.toFixed(2).replace('.', ',')}</Text>
            </View>
            
            <View style={styles.promocaoItem}>
              <Text style={styles.promocaoTexto}>Total arrecadado s/ desconto:</Text>
              <Text style={styles.promocaoValor}>R$ {totaisPromocao.totalSemPromocao.toFixed(2).replace('.', ',')}</Text>
            </View>
            
            <View style={styles.promocaoTotal}>
              <Text style={styles.promocaoTotalTexto}>Economia em descontos:</Text>
              <Text style={styles.promocaoTotalValor}>
                R$ {totaisPromocao.economiaTotal.toFixed(2).replace('.', ',')}
              </Text>
            </View>
          </View>
        )}
        
        {/* Botão dentro do ScrollView para mobile */}
        <PrintWrapper hideOnPrint>
          <TouchableOpacity style={styles.botaoPDFInline} onPress={gerarPDF}>
            <Text style={styles.textoBotaoPDF}>Imprimir / PDF</Text>
          </TouchableOpacity>
        </PrintWrapper>

      </ScrollView>

      <Modal
        visible={modalPagamento}
        transparent
        animationType="slide"
        onRequestClose={() => setModalPagamento(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>Como foi pago?</Text>
            <Text style={styles.modalSubtitulo}>
              {vendaSelecionada?.nomePagador} - R$ {vendaSelecionada?.total.toFixed(2).replace('.', ',')}
            </Text>
            
            <TouchableOpacity 
              style={styles.botaoPagamento} 
              onPress={() => marcarComoPago('PIX')}
            >
              <Text style={styles.textoBotaoPagamento}>PIX</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.botaoPagamento} 
              onPress={() => marcarComoPago('DINHEIRO')}
            >
              <Text style={styles.textoBotaoPagamento}>DINHEIRO</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.botaoPagamento} 
              onPress={() => marcarComoPago('CARTAO')}
            >
              <Text style={styles.textoBotaoPagamento}>CARTÃO</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.botaoCancelar} 
              onPress={() => {
                setModalPagamento(false);
                setVendaSelecionada(null);
              }}
            >
              <Text style={styles.textoBotaoCancelar}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
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
  botaoVoltar: {
    color: '#fff',
    fontSize: fontSize.medium,
  },
  titulo: {
    color: '#fff',
    fontSize: fontSize.xlarge,
    fontWeight: 'bold',
  },
  botaoLimpar: {
    backgroundColor: '#f44336',
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
    borderRadius: moderateScale(6),
  },
  textoBotaoLimpar: {
    color: '#fff',
    fontSize: fontSize.regular,
    fontWeight: '600',
  },
  conteudo: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.large,
    paddingBottom: spacing.huge * 2, // Padding extra no final
    maxWidth: isTablet ? 768 : '100%',
    alignSelf: 'center',
    width: '100%',
  },
  infoContainer: {
    backgroundColor: '#fff',
    padding: spacing.large,
    borderRadius: moderateScale(10),
    marginBottom: spacing.large,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ministerio: {
    fontSize: fontSize.xxlarge,
    fontWeight: 'bold',
    color: '#333',
  },
  responsavel: {
    fontSize: fontSize.large,
    color: '#666',
    marginTop: spacing.tiny,
  },
  resumoGeral: {
    backgroundColor: '#fff',
    padding: spacing.large,
    borderRadius: moderateScale(10),
    marginBottom: spacing.large,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  subtitulo: {
    fontSize: fontSize.xlarge,
    fontWeight: '600',
    color: '#333',
    marginBottom: spacing.medium,
  },
  formaPagamento: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.regular,
  },
  formaPagamentoTexto: {
    fontSize: fontSize.large,
    color: '#666',
  },
  formaPagamentoValor: {
    fontSize: fontSize.large,
    color: '#333',
    fontWeight: '500',
  },
  totalGeral: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.medium,
    paddingTop: spacing.medium,
    borderTopWidth: 2,
    borderTopColor: '#e0e0e0',
  },
  totalGeralTexto: {
    fontSize: fontSize.xlarge,
    fontWeight: 'bold',
    color: '#333',
  },
  totalGeralValor: {
    fontSize: fontSize.xxlarge,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  listaVendas: {
    backgroundColor: '#fff',
    padding: spacing.large,
    borderRadius: moderateScale(10),
    marginBottom: spacing.large,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  vendaItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: spacing.medium,
  },
  vendaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.small,
  },
  vendaNumero: {
    fontSize: fontSize.medium,
    fontWeight: '600',
    color: '#333',
  },
  vendaData: {
    fontSize: fontSize.regular,
    color: '#666',
  },
  vendaNome: {
    fontSize: fontSize.large,
    fontWeight: '600',
    color: '#333',
  },
  botaoRemover: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
    borderRadius: moderateScale(5),
  },
  textoBotaoRemover: {
    color: '#fff',
    fontSize: fontSize.regular,
    fontWeight: '600',
  },
  botaoPago: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
    borderRadius: moderateScale(5),
  },
  textoBotaoPago: {
    color: '#fff',
    fontSize: fontSize.regular,
    fontWeight: '600',
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
    marginBottom: spacing.regular,
    textAlign: 'center',
    color: '#333',
  },
  modalSubtitulo: {
    fontSize: fontSize.medium,
    color: '#666',
    marginBottom: spacing.xlarge,
    textAlign: 'center',
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
  totalizadorContainer: {
    backgroundColor: '#fff',
    padding: spacing.large,
    borderRadius: moderateScale(10),
    marginBottom: spacing.large,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  totalizadorItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.small,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  totalizadorItemNome: {
    fontSize: fontSize.medium,
    color: '#333',
    flex: 1,
  },
  totalizadorItemQuantidade: {
    fontSize: fontSize.medium,
    color: '#666',
    fontWeight: '500',
  },
  totalizadorTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.medium,
    paddingTop: spacing.medium,
    borderTopWidth: 2,
    borderTopColor: '#e0e0e0',
  },
  totalizadorTotalTexto: {
    fontSize: fontSize.large,
    fontWeight: 'bold',
    color: '#333',
  },
  totalizadorTotalValor: {
    fontSize: fontSize.large,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  subtituloTipo: {
    fontSize: fontSize.medium,
    fontWeight: '600',
    color: '#666',
    marginTop: spacing.medium,
    marginBottom: spacing.regular,
  },
  vendaItemCompacto: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.small,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  vendaResumo: {
    fontSize: fontSize.regular,
    color: '#666',
    flex: 1,
  },
  vendaValor: {
    fontSize: fontSize.regular,
    fontWeight: '600',
    color: '#333',
  },
  vendaItemTexto: {
    fontSize: fontSize.regular,
    color: '#666',
    marginBottom: spacing.tiny,
  },
  vendaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.small,
  },
  vendaFormaPagamento: {
    fontSize: fontSize.regular,
    fontWeight: '500',
    color: '#2196F3',
  },
  vendaTotal: {
    fontSize: fontSize.medium,
    fontWeight: '600',
    color: '#333',
  },
  footerButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: spacing.large,
    paddingVertical: spacing.medium,
    paddingBottom: Platform.OS === 'ios' ? spacing.large : spacing.medium, // Safe area para iOS
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  botaoPDF: {
    backgroundColor: '#4CAF50',
    padding: spacing.large,
    borderRadius: moderateScale(10),
    alignItems: 'center',
    height: componentSize.buttonHeight,
    justifyContent: 'center',
  },
  textoBotaoPDF: {
    color: '#fff',
    fontSize: fontSize.large,
    fontWeight: 'bold',
  },
  botaoPDFInline: {
    backgroundColor: '#4CAF50',
    padding: spacing.large,
    borderRadius: moderateScale(10),
    alignItems: 'center',
    height: componentSize.buttonHeight,
    justifyContent: 'center',
    marginTop: spacing.large,
    marginHorizontal: spacing.medium,
    marginBottom: spacing.large,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dataImpressao: {
    fontSize: fontSize.regular,
    color: '#666',
    marginTop: spacing.small,
    fontStyle: 'italic',
  },
  cupomFiscal: {
    padding: 10,
    backgroundColor: '#fff',
  },
  cupomSection: {
    marginVertical: 5,
  },
  promocaoContainer: {
    backgroundColor: '#fff',
    padding: spacing.large,
    borderRadius: moderateScale(10),
    marginBottom: spacing.large,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  promocaoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.small,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  promocaoTexto: {
    fontSize: fontSize.medium,
    color: '#333',
    flex: 1,
  },
  promocaoValor: {
    fontSize: fontSize.medium,
    color: '#666',
    fontWeight: '500',
  },
  promocaoTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.medium,
    paddingTop: spacing.medium,
    borderTopWidth: 2,
    borderTopColor: '#e0e0e0',
  },
  promocaoTotalTexto: {
    fontSize: fontSize.large,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  promocaoTotalValor: {
    fontSize: fontSize.large,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  listaPagarDepois: {
    marginTop: spacing.small,
    marginBottom: spacing.medium,
    paddingHorizontal: spacing.medium,
    backgroundColor: '#fff3cd',
    borderRadius: moderateScale(8),
    padding: spacing.regular,
  },
  listaPagarDepoisTitulo: {
    fontSize: fontSize.regular,
    fontWeight: '600',
    color: '#856404',
    marginBottom: spacing.small,
  },
  listaPagarDepoisNome: {
    fontSize: fontSize.regular,
    color: '#856404',
    marginLeft: spacing.small,
    marginBottom: spacing.tiny,
  },
});