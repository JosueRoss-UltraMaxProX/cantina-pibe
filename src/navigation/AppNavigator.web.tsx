import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ConfiguracaoScreen } from '../screens/ConfiguracaoScreen';
import { VendasScreen } from '../screens/VendasScreen';
import { ResumoScreen } from '../screens/ResumoScreen';
import { Platform } from 'react-native';

const Stack = createStackNavigator();

// Desabilitar gestos no web para evitar problemas
const screenOptions = Platform.OS === 'web' 
  ? {
      headerShown: false,
      animationEnabled: false,
      gestureEnabled: false,
    }
  : {
      headerShown: false,
    };

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Configuracao"
        screenOptions={screenOptions}
      >
        <Stack.Screen name="Configuracao" component={ConfiguracaoScreen} />
        <Stack.Screen name="Vendas" component={VendasScreen} />
        <Stack.Screen name="Resumo" component={ResumoScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}