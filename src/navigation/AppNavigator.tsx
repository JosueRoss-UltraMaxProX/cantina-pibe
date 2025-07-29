import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ConfiguracaoScreen } from '../screens/ConfiguracaoScreen';
import { VendasScreen } from '../screens/VendasScreen';
import { ResumoScreen } from '../screens/ResumoScreen';

const Stack = createStackNavigator();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Configuracao"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Configuracao" component={ConfiguracaoScreen} />
        <Stack.Screen name="Vendas" component={VendasScreen} />
        <Stack.Screen name="Resumo" component={ResumoScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}