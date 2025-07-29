// Mock para react-native-safe-area-context no web
import React from 'react';

export const SafeAreaProvider = ({ children }) => children;
export const SafeAreaView = ({ children, style }) => (
  <div style={style}>{children}</div>
);
export const useSafeAreaInsets = () => ({
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
});
export const SafeAreaConsumer = ({ children }) => children({ 
  insets: { top: 0, right: 0, bottom: 0, left: 0 } 
});

export default {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
  SafeAreaConsumer
};