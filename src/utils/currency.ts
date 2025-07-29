export const formatCurrency = (value: string): string => {
  // Remove tudo que não é dígito
  const numericValue = value.replace(/\D/g, '');
  
  if (!numericValue) return '';
  
  // Converte para número e divide por 100 para ter os centavos
  const numberValue = parseInt(numericValue) / 100;
  
  // Formata para moeda brasileira
  return numberValue.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const parseCurrency = (formattedValue: string): number => {
  // Remove formatação e converte para número
  const numericValue = formattedValue.replace(/\D/g, '');
  return parseInt(numericValue || '0') / 100;
};

export const formatCurrencyDisplay = (value: number): string => {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
};