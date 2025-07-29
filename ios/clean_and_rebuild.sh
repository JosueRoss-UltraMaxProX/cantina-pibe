#!/bin/bash

echo "🧹 Limpando projeto iOS..."

# Fechar Xcode
echo "Fechando Xcode..."
killall Xcode 2>/dev/null || true

# Limpar DerivedData
echo "Limpando DerivedData..."
rm -rf ~/Library/Developer/Xcode/DerivedData/*

# Limpar cache do CocoaPods
echo "Limpando cache do CocoaPods..."
rm -rf ~/Library/Caches/CocoaPods

# Limpar pasta Pods e arquivos relacionados
echo "Removendo Pods antigos..."
cd "$(dirname "$0")"
rm -rf Pods
rm -rf Podfile.lock
rm -rf build

# Verificar se CocoaPods está instalado
if ! command -v pod &> /dev/null; then
    echo "❌ CocoaPods não está instalado. Instale com: sudo gem install cocoapods"
    exit 1
fi

# Instalar pods novamente
echo "Instalando CocoaPods..."
pod install

echo "✅ Limpeza concluída!"
echo ""
echo "IMPORTANTE:"
echo "1. Abra o arquivo CantinaDaPibe.xcworkspace (NÃO o .xcodeproj)"
echo "2. No Xcode: Product > Clean Build Folder (Cmd+Shift+K)"
echo "3. Compile o projeto novamente (Cmd+B)"