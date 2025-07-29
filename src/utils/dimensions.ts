import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

// Dimensões da tela
export const SCREEN_WIDTH = width;
export const SCREEN_HEIGHT = height;

// Detectar tipo de dispositivo
export const isIPad = Platform.OS === 'ios' && (width >= 768 || height >= 768);
export const isTablet = width >= 768 || height >= 768;
export const isMobile = width < 768;
export const isSmallMobile = width < 375;

// Breakpoints responsivos
export const breakpoints = {
  small: 375,
  medium: 768,
  large: 1024,
  xlarge: 1280,
};

// Grid layout responsivo
export const gridLayout = {
  // Produtos em grid - ajustado para diferentes tamanhos
  productColumns: width >= breakpoints.large ? 4 : width >= breakpoints.medium ? 3 : 2,
  productCardWidth: width >= breakpoints.large ? 220 : 
                    width >= breakpoints.medium ? (width - 64) / 3 : 
                    (width - 32) / 2,
  productCardHeight: width >= breakpoints.medium ? 280 : 220,
  
  // Espaçamentos responsivos
  containerPadding: width >= breakpoints.medium ? 24 : 16,
  itemSpacing: width >= breakpoints.medium ? 16 : 12,
};

// Tamanhos de fonte responsivos
export const responsiveFontSize = {
  small: width >= breakpoints.medium ? 14 : 12,
  regular: width >= breakpoints.medium ? 16 : 14,
  medium: width >= breakpoints.medium ? 18 : 16,
  large: width >= breakpoints.medium ? 24 : 20,
  xlarge: width >= breakpoints.medium ? 32 : 24,
  xxlarge: width >= breakpoints.medium ? 40 : 28,
};

// Dimensões de componentes responsivos
export const componentSizes = {
  buttonHeight: width >= breakpoints.medium ? 56 : 48,
  inputHeight: width >= breakpoints.medium ? 56 : 48,
  headerHeight: width >= breakpoints.medium ? 80 : 60,
  tabBarHeight: width >= breakpoints.medium ? 70 : 56,
};