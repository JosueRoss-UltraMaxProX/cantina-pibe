import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  StatusBar,
} from "react-native";
// import { useNavigation } from '@react-navigation/native';
import { ConfiguracaoInicial, Item } from "../types/cantina";
import { StorageService } from "../services/storage";
import {
  fontSize,
  spacing,
  componentSize,
  isTablet,
  moderateScale,
  scale,
} from "../utils/responsive";
import { formatCurrency, parseCurrency } from "../utils/currency";
import { ConfiguracaoScreenProps } from "../types/navigation";

export function ConfiguracaoScreen({ navigation }: ConfiguracaoScreenProps) {
  // const navigation = useNavigation<any>();
  const [ministerio, setMinisterio] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [novoItemNome, setNovoItemNome] = useState("");
  const [, setNovoItemPreco] = useState("");
  const [precoFormatado, setPrecoFormatado] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    carregarConfiguracaoExistente();
  }, []);

  const carregarConfiguracaoExistente = async () => {
    const config = await StorageService.obterConfiguracao();
    if (config) {
      setMinisterio(config.ministerio);
      setResponsavel(config.responsavel);
      setItems(config.items);
      setIsEditMode(true);
    }
  };

  const handlePrecoChange = (text: string) => {
    const formatted = formatCurrency(text);
    setPrecoFormatado(formatted);
    setNovoItemPreco(text);
  };

  const adicionarItem = () => {
    if (!novoItemNome.trim() || !precoFormatado.trim()) {
      Alert.alert("Atenção", "Preencha o nome e o preço do item");
      return;
    }

    const preco = parseCurrency(precoFormatado);
    if (isNaN(preco) || preco <= 0) {
      Alert.alert("Atenção", "Digite um preço válido");
      return;
    }

    const novoItem: Item = {
      id: Date.now().toString(),
      nome: novoItemNome.trim(),
      preco: preco,
    };

    setItems([...items, novoItem]);
    setNovoItemNome("");
    setNovoItemPreco("");
    setPrecoFormatado("");
  };

  const removerItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const salvarConfiguracaoEContinuar = async () => {
    console.log("Iniciando salvarConfiguracaoEContinuar");
    console.log("isEditMode:", isEditMode);
    console.log("ministerio:", ministerio);
    console.log("responsavel:", responsavel);
    console.log("items:", items);

    if (!ministerio.trim() || !responsavel.trim()) {
      Alert.alert("Atenção", "Preencha o ministério e o responsável");
      return;
    }

    if (items.length === 0) {
      Alert.alert("Atenção", "Adicione pelo menos um item");
      return;
    }

    const configuracao: ConfiguracaoInicial = {
      ministerio: ministerio.trim(),
      responsavel: responsavel.trim(),
      items,
    };

    try {
      console.log("Salvando configuração:", configuracao);
      await StorageService.salvarConfiguracao(configuracao);
      console.log("Configuração salva com sucesso");

      // Pequeno delay para garantir que a configuração foi salva
      await new Promise((resolve) => setTimeout(resolve, 100));

      console.log("Navegando para tela de vendas...");
      console.log("navigation:", navigation);

      // Sempre navega para a tela de Vendas
      navigation.navigate("Vendas");
    } catch (error) {
      console.error("Erro ao salvar configuração:", error);
      Alert.alert("Erro", "Não foi possível salvar a configuração");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1565C0" />
      <View style={styles.header}>
        <View style={styles.headerBackground}>
          <View style={styles.titleContainer}>
            <Text style={styles.titulo}>Cantina da Igreja</Text>
            <Text style={styles.subtituloHeader}>Configure sua cantina</Text>
          </View>
        </View>
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
        bounces={true}
        overScrollMode="always"
        scrollEventThrottle={16}
        decelerationRate="normal"
      >
        <View style={styles.containerFormulario}>
          <Text style={styles.subtitulo}>Informações do Ministério</Text>

          <Text style={styles.label}>Nome do Ministério Responsável</Text>
          <TextInput
            style={styles.input}
            value={ministerio}
            onChangeText={setMinisterio}
            placeholder="Ex: Ministério de Jovens"
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>Nome do Responsável pelo Caixa</Text>
          <TextInput
            style={styles.input}
            value={responsavel}
            onChangeText={setResponsavel}
            placeholder="Ex: João Silva"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.containerFormulario}>
          <Text style={styles.subtitulo}>Adicionar Itens</Text>

          <Text style={styles.label}>Nome do Item</Text>
          <TextInput
            style={styles.input}
            value={novoItemNome}
            onChangeText={setNovoItemNome}
            placeholder="Ex: Cachorro-quente"
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>Preço (R$)</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.currencySymbol}>R$</Text>
            <TextInput
              style={styles.inputWithSymbol}
              value={precoFormatado}
              onChangeText={handlePrecoChange}
              placeholder="0,00"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity
            style={styles.botaoAdicionar}
            onPress={adicionarItem}
          >
            <Text style={styles.textoBotaoAdicionar}>Adicionar Item</Text>
          </TouchableOpacity>
        </View>

        {items.length > 0 && (
          <View style={styles.containerItens}>
            <Text style={styles.subtitulo}>Itens Adicionados</Text>
            {items.map((item) => (
              <View key={item.id} style={styles.itemLista}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemNome}>{item.nome}</Text>
                  <Text style={styles.itemPreco}>
                    R$ {item.preco.toFixed(2).replace(".", ",")}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.botaoRemover}
                  onPress={() => removerItem(item.id)}
                >
                  <Text style={styles.textoBotaoRemover}>Remover</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.botaoIniciar,
            (!ministerio || !responsavel || items.length === 0) &&
              styles.botaoDesabilitado,
          ]}
          onPress={() => {
            console.log("Botão clicado!");
            salvarConfiguracaoEContinuar();
          }}
          disabled={!ministerio || !responsavel || items.length === 0}
        >
          <Text style={styles.textoBotaoIniciar}>
            {isEditMode ? "Salvar Alterações" : "Iniciar Vendas"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.large,
    paddingBottom: spacing.huge * 3, // Padding extra no final
    maxWidth: isTablet ? 768 : "100%",
    alignSelf: "center",
    width: "100%",
  },
  header: {
    backgroundColor: "#1565C0",
    paddingTop: spacing.huge,
    paddingBottom: spacing.xlarge,
    paddingHorizontal: spacing.large,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  headerBackground: {
    backgroundColor: "transparent",
  },
  titleContainer: {
    flex: 1,
  },
  subtituloHeader: {
    fontSize: fontSize.medium,
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: spacing.tiny,
  },
  titulo: {
    fontSize: fontSize.huge,
    fontWeight: "bold",
    color: "#ffffff",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  containerFormulario: {
    backgroundColor: "#fff",
    padding: spacing.large,
    borderRadius: moderateScale(16),
    marginBottom: spacing.large,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  subtitulo: {
    fontSize: fontSize.xlarge,
    fontWeight: "700",
    color: "#2c3e50",
    marginBottom: spacing.medium,
    letterSpacing: -0.5,
  },
  label: {
    fontSize: fontSize.medium,
    color: "#5a6c7d",
    marginBottom: spacing.small,
    fontWeight: "500",
  },
  input: {
    borderWidth: 2,
    borderColor: "#e1e8ed",
    borderRadius: moderateScale(12),
    padding: spacing.regular,
    fontSize: fontSize.medium,
    marginBottom: spacing.medium,
    backgroundColor: "#fff",
    height: isTablet
      ? componentSize.tabletInputHeight
      : componentSize.inputHeight,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e1e8ed",
    borderRadius: moderateScale(12),
    backgroundColor: "#fff",
    marginBottom: spacing.medium,
    height: isTablet
      ? componentSize.tabletInputHeight
      : componentSize.inputHeight,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  currencySymbol: {
    fontSize: fontSize.medium,
    color: "#5a6c7d",
    fontWeight: "600",
    paddingLeft: spacing.regular,
    paddingRight: spacing.small,
  },
  inputWithSymbol: {
    flex: 1,
    fontSize: fontSize.medium,
    padding: spacing.regular,
    paddingLeft: 0,
    height: "100%",
  },
  botaoAdicionar: {
    backgroundColor: "#27ae60",
    padding: spacing.medium,
    borderRadius: moderateScale(12),
    alignItems: "center",
    height: isTablet
      ? componentSize.tabletButtonHeight
      : componentSize.buttonHeight,
    justifyContent: "center",
    shadowColor: "#27ae60",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  textoBotaoAdicionar: {
    color: "#fff",
    fontSize: fontSize.medium,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  containerItens: {
    backgroundColor: "#fff",
    padding: spacing.large,
    borderRadius: moderateScale(16),
    marginBottom: spacing.large,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  itemLista: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.regular,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f3f4",
    backgroundColor: "#fafbfc",
    marginBottom: spacing.small,
    borderRadius: moderateScale(8),
    paddingHorizontal: spacing.regular,
  },
  itemInfo: {
    flex: 1,
    marginRight: spacing.regular,
  },
  itemNome: {
    fontSize: fontSize.medium,
    color: "#2c3e50",
    marginBottom: spacing.tiny,
    fontWeight: "600",
  },
  itemPreco: {
    fontSize: fontSize.regular,
    color: "#27ae60",
    fontWeight: "700",
  },
  botaoRemover: {
    backgroundColor: "#e74c3c",
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
    borderRadius: moderateScale(8),
    shadowColor: "#e74c3c",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  textoBotaoRemover: {
    color: "#fff",
    fontSize: fontSize.regular,
    fontWeight: "600",
  },
  botaoIniciar: {
    backgroundColor: "#3498db",
    padding: spacing.large,
    borderRadius: moderateScale(16),
    alignItems: "center",
    marginTop: spacing.regular,
    height: isTablet
      ? componentSize.tabletButtonHeight
      : componentSize.buttonHeight,
    justifyContent: "center",
    shadowColor: "#3498db",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  botaoDesabilitado: {
    backgroundColor: "#ccc",
  },
  textoBotaoIniciar: {
    color: "#fff",
    fontSize: fontSize.large,
    fontWeight: "bold",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  precoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  precoOriginal: {
    fontSize: fontSize.regular,
    color: "#999",
    textDecorationLine: "line-through",
    marginRight: spacing.small,
  },
  precoPromocional: {
    fontSize: fontSize.regular,
    color: "#e74c3c",
    fontWeight: "700",
  },
  botoesContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.small,
  },
  botaoPromocao: {
    backgroundColor: "#f39c12",
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
    borderRadius: moderateScale(8),
  },
  botaoPromocaoAtiva: {
    backgroundColor: "#e74c3c",
  },
  textoBotaoPromocao: {
    color: "#fff",
    fontSize: fontSize.regular,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: spacing.xlarge,
    borderRadius: moderateScale(16),
    width: "85%",
    maxWidth: scale(400),
  },
  modalTitulo: {
    fontSize: fontSize.xxlarge,
    fontWeight: "bold",
    marginBottom: spacing.medium,
    textAlign: "center",
    color: "#333",
  },
  modalSubtitulo: {
    fontSize: fontSize.large,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: spacing.small,
  },
  modalInfo: {
    fontSize: fontSize.regular,
    color: "#666",
    textAlign: "center",
    marginBottom: spacing.medium,
    paddingHorizontal: spacing.medium,
  },
  modalPrecoOriginal: {
    fontSize: fontSize.medium,
    color: "#666",
    textAlign: "center",
    marginBottom: spacing.large,
  },
  botaoAplicar: {
    backgroundColor: "#27ae60",
    padding: spacing.large,
    borderRadius: moderateScale(12),
    alignItems: "center",
    marginBottom: spacing.medium,
    height: componentSize.buttonHeight,
    justifyContent: "center",
    shadowColor: "#27ae60",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  textoBotaoAplicar: {
    color: "#fff",
    fontSize: fontSize.medium,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  botaoCancelar: {
    backgroundColor: "#95a5a6",
    padding: spacing.medium,
    borderRadius: moderateScale(10),
    alignItems: "center",
    height: componentSize.buttonHeight,
    justifyContent: "center",
  },
  textoBotaoCancelar: {
    color: "#fff",
    fontSize: fontSize.medium,
    fontWeight: "600",
  },
});
