# Cantina da Pibe - App de Pedidos

Aplicação React Native para gerenciamento de pedidos de uma cantina, com database local SQLite.

## Estrutura do Projeto

```
src/
├── assets/          # Imagens e fontes
├── components/      # Componentes reutilizáveis
├── config/          # Configurações (tema, constantes)
├── database/        # Configuração e inicialização do SQLite
├── hooks/           # Custom hooks
├── navigation/      # Navegação da aplicação
├── screens/         # Telas da aplicação
├── services/        # Serviços de acesso ao banco de dados
├── store/           # Gerenciamento de estado
├── types/           # Tipos TypeScript
└── utils/           # Funções utilitárias
```

## Database SQLite

O app usa SQLite para armazenamento local com as seguintes tabelas:

- **products**: Produtos da cantina
- **orders**: Pedidos realizados
- **order_items**: Itens de cada pedido
- **categories**: Categorias de produtos

## Instalação

1. Instalar dependências:
```bash
npm install
```

2. Para iOS (macOS apenas):
```bash
cd ios && pod install
```

## Executar o Projeto

Android:
```bash
npx react-native run-android
```

iOS:
```bash
npx react-native run-ios
```

## Funcionalidades Planejadas

- [ ] Listagem de produtos por categoria
- [ ] Carrinho de compras
- [ ] Criação de pedidos
- [ ] Histórico de pedidos
- [ ] Gestão de produtos (admin)
- [ ] Dashboard de vendas

## Tecnologias

- React Native
- TypeScript
- SQLite (react-native-sqlite-storage)
- React Navigation (a ser instalado)
- React Native Vector Icons (a ser instalado)