// Mock para react-native-screens no web
import React from 'react';

export const enableScreens = () => {};
export const ScreenContainer = ({ children }) => children;
export const Screen = ({ children }) => children;
export const NativeScreen = ({ children }) => children;
export const ScreenStack = ({ children }) => children;
export const ScreenStackHeaderConfig = () => null;

export default {
  enableScreens,
  ScreenContainer,
  Screen,
  NativeScreen,
  ScreenStack,
  ScreenStackHeaderConfig
};