import React from 'react';
import { View, Platform } from 'react-native';

interface PrintWrapperProps {
  children: React.ReactNode;
  hideOnPrint?: boolean;
  showOnlyOnPrint?: boolean;
  className?: string;
}

export const PrintWrapper: React.FC<PrintWrapperProps> = ({ 
  children, 
  hideOnPrint, 
  showOnlyOnPrint,
  className = ''
}) => {
  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  let printClass = '';
  if (hideOnPrint) {
    printClass = 'print:hidden no-print';
  } else if (showOnlyOnPrint) {
    printClass = 'screen:hidden print:block';
  }

  const combinedClassName = `${printClass} ${className}`.trim();

  return (
    <View 
      style={{ width: '100%' }}
      // @ts-ignore - className is valid for react-native-web
      className={combinedClassName}
    >
      {children}
    </View>
  );
};