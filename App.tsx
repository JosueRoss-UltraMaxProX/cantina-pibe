import React from 'react';
import { Platform } from 'react-native';

// Importar gesture-handler apenas em mobile
if (Platform.OS !== 'web') {
  require('react-native-gesture-handler');
}

import { AppNavigator } from './src/navigation/AppNavigator';

function App() {
  return <AppNavigator />;
}

export default App;
