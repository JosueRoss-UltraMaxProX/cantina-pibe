#!/bin/bash

echo "=== Preparando para executar no iPad físico ==="
echo ""
echo "Certifique-se de que:"
echo "1. Seu iPad está conectado via USB"
echo "2. Você confia neste computador no iPad"
echo "3. O iPad está desbloqueado"
echo ""
echo "Pressione Enter para continuar..."
read

# Listar dispositivos conectados
echo "Dispositivos conectados:"
xcrun devicectl list devices

echo ""
echo "Executando no dispositivo..."
npx react-native run-ios --device

echo ""
echo "Se falhar, tente:"
echo "1. Abrir o projeto no Xcode: open ios/CantinaDaPibe.xcworkspace"
echo "2. Selecionar seu iPad como destino"
echo "3. Clicar em Run (▶️)"