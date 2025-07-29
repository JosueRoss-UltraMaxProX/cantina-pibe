import React, { useState } from 'react';
import { ConfiguracaoScreen } from '../screens/ConfiguracaoScreen';
import { VendasScreen } from '../screens/VendasScreen';
import { ResumoScreen } from '../screens/ResumoScreen';

export function SimpleRouter() {
  const [currentScreen, setCurrentScreen] = useState('Configuracao');
  const [key, setKey] = useState(0); // Chave para forçar re-render


  const navigation = {
    navigate: (screenName: string) => {
      if (screenName === 'Configuracao') {
        // Forçar re-render ao voltar para configuração
        setKey(prev => prev + 1);
      }
      setCurrentScreen(screenName);
    },
    goBack: () => {
      if (currentScreen === 'Resumo') setCurrentScreen('Vendas');
      else if (currentScreen === 'Vendas') setCurrentScreen('Configuracao');
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Configuracao':
        return <ConfiguracaoScreen key={key} navigation={navigation} />;
      case 'Vendas':
        return <VendasScreen navigation={navigation} />;
      case 'Resumo':
        return <ResumoScreen navigation={navigation} />;
      default:
        return <ConfiguracaoScreen key={key} navigation={navigation} />;
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'auto' }}>
      {renderScreen()}
    </div>
  );
}