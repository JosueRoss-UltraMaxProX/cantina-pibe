#!/bin/bash

echo "🔧 Corrigindo build do iOS..."

# Mover para o diretório iOS
cd "$(dirname "$0")"

# Fechar Xcode
echo "Fechando Xcode..."
killall Xcode 2>/dev/null || true
sleep 2

# Limpar tudo
echo "🧹 Limpando arquivos antigos..."
rm -rf ~/Library/Developer/Xcode/DerivedData/*
rm -rf ~/Library/Caches/CocoaPods
rm -rf Pods
rm -rf build
rm -f Podfile.lock

# Limpar cache do npm/yarn
echo "🧹 Limpando cache do npm..."
cd ..
rm -rf node_modules/.cache
npm cache clean --force 2>/dev/null || true

# Reinstalar node_modules se necessário
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências do Node..."
    npm install
fi

# Voltar para o diretório iOS
cd ios

# Desintegrar pods antigos
echo "🔄 Desintegrando CocoaPods antigos..."
pod deintegrate 2>/dev/null || true

# Instalar/atualizar CocoaPods
echo "📦 Instalando CocoaPods..."
if ! command -v pod &> /dev/null; then
    echo "❌ CocoaPods não está instalado. Instalando..."
    sudo gem install cocoapods
fi

# Atualizar repo specs do CocoaPods
echo "🔄 Atualizando repo do CocoaPods..."
pod repo update

# Instalar pods
echo "📦 Instalando Pods..."
pod install

echo "✅ Correções aplicadas!"
echo ""
echo "PRÓXIMOS PASSOS:"
echo "1. Abra o Xcode"
echo "2. Abra o arquivo: CantinaDaPibe.xcworkspace (NÃO o .xcodeproj)"
echo "3. Selecione seu dispositivo/simulador"
echo "4. No Xcode: Product > Clean Build Folder (Cmd+Shift+K)"
echo "5. No Xcode: Product > Build (Cmd+B)"
echo ""
echo "Se ainda houver erros:"
echo "- Vá em: File > Workspace Settings > Build System"
echo "- Certifique-se de que está usando 'New Build System'"
echo "- Delete DerivedData novamente se necessário"