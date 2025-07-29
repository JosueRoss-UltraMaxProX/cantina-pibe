import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { initDatabase } from './database/database';
import { HomeScreen } from './screens/HomeScreen';

function App(): React.JSX.Element {
  useEffect(() => {
    const setupDatabase = async () => {
      try {
        await initDatabase();
        console.log('Database initialized successfully');
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    };

    setupDatabase();
  }, []);

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <HomeScreen />
    </>
  );
}

export default App;