#!/bin/bash

echo "=== Executando Cantina da Pibe no iPad ==="
echo ""

# Listar simuladores disponíveis
echo "Simuladores de iPad disponíveis:"
xcrun simctl list devices | grep -i ipad

echo ""
echo "Tentando executar no iPad..."

# Tentar diferentes simuladores de iPad
if npx react-native run-ios --simulator="iPad Air (3rd generation)"; then
    echo "Executado com sucesso!"
elif npx react-native run-ios --simulator="iPad (6th generation)"; then
    echo "Executado com sucesso!"
elif npx react-native run-ios --simulator="iPad Pro (9.7-inch)"; then
    echo "Executado com sucesso!"
else
    echo ""
    echo "Não foi possível executar automaticamente."
    echo "Use o comando abaixo com o nome do simulador desejado:"
    echo "npx react-native run-ios --simulator='NOME_DO_SIMULADOR'"
fi