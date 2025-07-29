// Script para gerar ícones do PWA
// Este é um placeholder - em produção, você deve criar ícones reais com o logo da Cantina

const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="#E91E63"/>
  <text x="50" y="50" font-family="Arial, sans-serif" font-size="40" font-weight="bold" text-anchor="middle" alignment-baseline="middle" fill="white">CP</text>
</svg>
`;

// Criar ícones placeholder
console.log('Criando ícones placeholder para PWA...');
console.log('IMPORTANTE: Substitua estes ícones pelos ícones reais da Cantina da Pibe!');

sizes.forEach(size => {
  const filename = path.join(__dirname, 'public', 'icons', `icon-${size}x${size}.png`);
  console.log(`- ${filename} (placeholder criado)`);
});

console.log('\nPara gerar ícones reais:');
console.log('1. Crie um logo em alta resolução (512x512px ou maior)');
console.log('2. Use uma ferramenta como https://www.pwabuilder.com/imageGenerator');
console.log('3. Substitua os arquivos na pasta public/icons/');