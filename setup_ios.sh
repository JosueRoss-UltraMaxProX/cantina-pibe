#!/bin/bash

echo "=== Configurando ambiente iOS para Cantina da Pibe ==="
echo ""

# 1. Configurar Xcode
echo "1. Configurando Xcode..."
echo "Execute: sudo xcode-select -s /Applications/Xcode.app/Contents/Developer"
echo "Pressione Enter após executar o comando acima..."
read

# 2. Aceitar licença do Xcode
echo "2. Aceitando licença do Xcode..."
sudo xcodebuild -license accept

# 3. Instalar CocoaPods
echo "3. Instalando CocoaPods..."
sudo gem install cocoapods

# 4. Configurar CocoaPods
echo "4. Configurando CocoaPods..."
pod setup

# 5. Instalar dependências do iOS
echo "5. Instalando dependências do projeto iOS..."
cd ios
pod install

echo ""
echo "=== Configuração concluída! ==="
echo ""
echo "Para executar o app no simulador de iPad:"
echo "npx react-native run-ios --simulator='iPad (6th generation)'"
echo ""
echo "Para listar simuladores disponíveis:"
echo "xcrun simctl list devices"