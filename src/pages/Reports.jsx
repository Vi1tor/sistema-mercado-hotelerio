import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, FileSpreadsheet, Loader } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { reportsAPI } from '../services/api';
import CitySelector from '../components/CitySelector';

export default function Reports() {
  const { selectedCity, setSelectedCity } = useApp();
  const [loading, setLoading] = useState({ pdf: false, excel: false });

  const handleDownloadPDF = async () => {
    if (!selectedCity) return;
    
    setLoading({ ...loading, pdf: true });
    try {
      const response = await reportsAPI.generatePDF(selectedCity);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-${selectedCity.toLowerCase()}-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Erro ao gerar relatório PDF');
    } finally {
      setLoading({ ...loading, pdf: false });
    }
  };

  const handleDownloadExcel = async () => {
    if (!selectedCity) return;
    
    setLoading({ ...loading, excel: true });
    try {
      const response = await reportsAPI.generateExcel(selectedCity);
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-${selectedCity.toLowerCase()}-${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading Excel:', error);
      alert('Erro ao gerar relatório Excel');
    } finally {
      setLoading({ ...loading, excel: false });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Relatórios</h1>
          <p className="text-gray-600 mt-1">Exporte análises completas em PDF ou Excel</p>
        </div>
        <CitySelector value={selectedCity} onChange={setSelectedCity} />
      </div>

      {/* Report Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PDF Report */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card card-hover"
        >
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center flex-shrink-0">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Relatório em PDF</h3>
              <p className="text-gray-600 text-sm mb-4">
                Relatório profissional com gráficos, estatísticas e análises detalhadas.
                Ideal para apresentações e documentação.
              </p>
              <ul className="space-y-1 mb-4 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                  Análise completa de mercado
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                  Lista detalhada de hospedagens
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                  Estatísticas e tendências
                </li>
              </ul>
              <button
                onClick={handleDownloadPDF}
                disabled={!selectedCity || loading.pdf}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading.pdf ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Baixar PDF
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Excel Report */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card card-hover"
        >
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center flex-shrink-0">
              <FileSpreadsheet className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Relatório em Excel</h3>
              <p className="text-gray-600 text-sm mb-4">
                Planilha completa com todos os dados estruturados.
                Perfeito para análises personalizadas e manipulação de dados.
              </p>
              <ul className="space-y-1 mb-4 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                  Dados brutos para análise
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                  Múltiplas planilhas organizadas
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                  Fácil manipulação de dados
                </li>
              </ul>
              <button
                onClick={handleDownloadExcel}
                disabled={!selectedCity || loading.excel}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading.excel ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Baixar Excel
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-4">Informações sobre os Relatórios</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <p>
            Os relatórios são gerados em tempo real com base nos dados mais recentes disponíveis
            para a cidade selecionada.
          </p>
          <p>
            <strong>Relatório PDF:</strong> Inclui resumo executivo, gráficos visuais, tabelas
            comparativas e análise detalhada de demanda e tendências.
          </p>
          <p>
            <strong>Relatório Excel:</strong> Contém múltiplas planilhas com dados de hospedagens,
            resumo estatístico, análise de mercado e histórico de preços quando disponível.
          </p>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mt-4">
            <p className="text-blue-900 font-medium">
              💡 Dica: Para obter os melhores resultados, certifique-se de que a cidade selecionada
              possui dados atualizados no sistema.
            </p>
          </div>
        </div>
      </motion.div>

      {!selectedCity && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card text-center py-12 bg-gradient-to-br from-primary-50 to-accent-50"
        >
          <FileText className="w-16 h-16 text-primary-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Selecione uma Cidade</h3>
          <p className="text-gray-600">
            Escolha uma cidade no seletor acima para gerar relatórios
          </p>
        </motion.div>
      )}
    </div>
  );
}
