#!/bin/bash

echo "=== Corrigindo projeto iOS ==="

# Instalar CocoaPods via Homebrew
echo "1. Instalando CocoaPods..."
brew install cocoapods || echo "CocoaPods já instalado ou erro"

# Limpar cache e arquivos antigos
echo "2. Limpando arquivos antigos..."
cd ios
rm -rf Pods Podfile.lock build

# Instalar pods
echo "3. Instalando dependências iOS..."
pod install

echo ""
echo "=== Pronto! ==="
echo "Agora execute: npm run ios"