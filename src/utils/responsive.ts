import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

// Breakpoints
export const isTablet = width >= 768;
export const isPhone = width < 768;
export const isSmallPhone = width < 375;
export const isWeb = Platform.OS === 'web';

// Dimensões base
const guidelineBaseWidth = 375; // iPhone X
const guidelineBaseHeight = 812;
const guidelineBaseWidthTablet = 768; // iPad

// Escalar baseado na largura do dispositivo
export const scale = (size: number) => {
  if (isTablet) {
    return (width / guidelineBaseWidthTablet) * size;
  }
  return (width / guidelineBaseWidth) * size;
};

// Escalar verticalmente
export const verticalScale = (size: number) => {
  if (isTablet) {
    return (height / guidelineBaseHeight) * size * 0.8; // Reduzir um pouco no tablet
  }
  return (height / guidelineBaseHeight) * size;
};

// Escalar com fator moderado (para fontes e elementos que não devem escalar muito)
export const moderateScale = (size: number, factor = 0.5) => {
  if (isTablet) {
    return size + (scale(size) - size) * factor * 0.7;
  }
  return size + (scale(size) - size) * factor;
};

// Helper para fontes
export const fontSize = {
  tiny: moderateScale(10),
  small: moderateScale(12),
  regular: moderateScale(14),
  medium: moderateScale(16),
  large: moderateScale(18),
  xlarge: moderateScale(20),
  xxlarge: moderateScale(24),
  huge: moderateScale(28),
};

// Helper para espaçamentos
export const spacing = {
  tiny: scale(4),
  small: scale(8),
  regular: scale(12),
  medium: scale(16),
  large: scale(20),
  xlarge: scale(24),
  xxlarge: scale(32),
  huge: scale(40),
};

// Helper para tamanhos de componentes
export const componentSize = {
  buttonHeight: verticalScale(48),
  inputHeight: verticalScale(48),
  headerHeight: verticalScale(60),
  tabletButtonHeight: verticalScale(56),
  tabletInputHeight: verticalScale(56),
};