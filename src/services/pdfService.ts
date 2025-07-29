import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import { ResumoVendas } from '../types/cantina';

export class PDFService {
  static async gerarPDFResumo(resumo: ResumoVendas): Promise<void> {
    // Agrupar vendas "Pagar Depois"
    const vendasPagarDepois = resumo.vendas.filter(v => v.formaPagamento === 'PAGAR_DEPOIS');
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Resumo - ${resumo.ministerio}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            font-size: 14px;
          }
          h1 {
            font-size: 20px;
            margin-bottom: 10px;
          }
          h2 {
            font-size: 16px;
            margin-top: 15px;
            margin-bottom: 10px;
          }
          .linha {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
          }
          .total {
            font-weight: bold;
            border-top: 1px solid #000;
            padding-top: 5px;
            margin-top: 10px;
          }
          .pendente {
            margin: 10px 0;
            padding: 10px;
            border: 1px solid #000;
          }
          @media print {
            body { margin: 10px; }
          }
        </style>
      </head>
      <body>
        <h1>${resumo.ministerio}</h1>
        <p>Responsável: ${resumo.responsavel} - ${new Date().toLocaleDateString('pt-BR')}</p>
        
        <h2>RESUMO</h2>
        <div class="linha">
          <span>PIX:</span>
          <span>R$ ${resumo.totaisPorFormaPagamento.PIX.toFixed(2).replace('.', ',')}</span>
        </div>
        <div class="linha">
          <span>DINHEIRO:</span>
          <span>R$ ${resumo.totaisPorFormaPagamento.DINHEIRO.toFixed(2).replace('.', ',')}</span>
        </div>
        <div class="linha">
          <span>CARTÃO:</span>
          <span>R$ ${resumo.totaisPorFormaPagamento.CARTAO.toFixed(2).replace('.', ',')}</span>
        </div>
        <div class="linha">
          <span>PAGAR DEPOIS:</span>
          <span>R$ ${resumo.totaisPorFormaPagamento.PAGAR_DEPOIS.toFixed(2).replace('.', ',')}</span>
        </div>
        <div class="linha total">
          <span>TOTAL:</span>
          <span>R$ ${resumo.totalGeral.toFixed(2).replace('.', ',')}</span>
        </div>

        ${vendasPagarDepois.length > 0 ? `
          <h2>PAGAR DEPOIS</h2>
          <div class="pendente">
            ${vendasPagarDepois.map(venda => `
              <div class="linha">
                <span>${venda.nomePagador}</span>
                <span>R$ ${venda.total.toFixed(2).replace('.', ',')}</span>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </body>
      </html>
    `;

    try {
      const options = {
        html,
        fileName: `resumo_vendas_${resumo.ministerio.replace(/\s+/g, '_')}_${new Date().getTime()}`,
        directory: 'Documents',
      };

      const file = await RNHTMLtoPDF.convert(options);
      
      if (file.filePath) {
        await Share.open({
          url: `file://${file.filePath}`,
          type: 'application/pdf',
          title: 'Compartilhar Resumo de Vendas',
        });
      }
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      throw error;
    }
  }
}