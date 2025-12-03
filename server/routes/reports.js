import express from 'express';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import xlsx from 'xlsx';
import Accommodation from '../models/Accommodation.js';
import MarketAnalysis from '../models/MarketAnalysis.js';
import { generateMockAccommodations, generateMockAnalysis } from '../mockData.js';

const router = express.Router();

// Generate PDF report for city
router.get('/pdf/:city', async (req, res) => {
  try {
    const { city } = req.params;

    let accommodations, analysis;
    
    if (!global.mongoConnected) {
      // Use mock data
      accommodations = generateMockAccommodations(city, 50);
      analysis = generateMockAnalysis(city);
    } else {
      [accommodations, analysis] = await Promise.all([
        Accommodation.find({ city: new RegExp(city, 'i'), isActive: true }).lean(),
        MarketAnalysis.findOne({ city: new RegExp(city, 'i') }).sort({ analysisDate: -1 }),
      ]);
    }

    if (accommodations.length === 0) {
      return res.status(404).json({ error: 'Nenhuma hospedagem encontrada para esta cidade' });
    }

    // Create PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Title
    doc.setFontSize(20);
    doc.setTextColor(14, 116, 144);
    doc.text(`Relatório de Mercado - ${city}`, pageWidth / 2, 20, { align: 'center' });

    // Date
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth / 2, 28, { align: 'center' });

    // Summary statistics
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Resumo Geral', 14, 40);

    const stats = {
      total: accommodations.length,
      avgPrice: (accommodations.reduce((sum, acc) => sum + acc.currentPrice, 0) / accommodations.length).toFixed(2),
      avgRating: accommodations.filter((a) => a.rating?.score).reduce((sum, acc, _, arr) => sum + acc.rating.score / arr.length, 0).toFixed(1),
    };

    doc.setFontSize(10);
    doc.text(`Total de Hospedagens: ${stats.total}`, 14, 50);
    doc.text(`Preço Médio: R$ ${stats.avgPrice}`, 14, 56);
    doc.text(`Avaliação Média: ${stats.avgRating}/10`, 14, 62);

    // Accommodations table
    doc.text('Lista de Hospedagens', 14, 75);

    const tableData = accommodations.slice(0, 50).map((acc) => [
      acc.name,
      acc.type,
      `R$ ${acc.currentPrice.toFixed(2)}`,
      acc.rating?.score ? acc.rating.score.toFixed(1) : 'N/A',
      acc.availability.isAvailable ? 'Sim' : 'Não',
    ]);

    autoTable(doc, {
      startY: 80,
      head: [['Nome', 'Tipo', 'Preço', 'Nota', 'Disponível']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [14, 116, 144] },
      styles: { fontSize: 8 },
    });

    // Analysis section if available
    if (analysis) {
      const finalY = doc.lastAutoTable.finalY || 80;
      
      if (finalY + 40 > doc.internal.pageSize.getHeight()) {
        doc.addPage();
        doc.setFontSize(14);
        doc.text('Análise de Mercado', 14, 20);
      } else {
        doc.setFontSize(14);
        doc.text('Análise de Mercado', 14, finalY + 15);
      }

      doc.setFontSize(10);
      const analysisY = finalY + 40 > doc.internal.pageSize.getHeight() ? 28 : finalY + 23;
      
      doc.text(`Nível de Demanda: ${analysis.demandAnalysis.level}`, 14, analysisY);
      doc.text(`Score: ${analysis.demandAnalysis.score}`, 14, analysisY + 6);
      doc.text(`Tendência: ${analysis.demandAnalysis.trend}`, 14, analysisY + 12);
      doc.text(`Taxa de Ocupação: ${analysis.occupancyAnalysis.occupancyRate?.toFixed(1) || 'N/A'}%`, 14, analysisY + 18);
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Sistema de Mercado Hoteleiro - Página ${i} de ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=relatorio-${city.toLowerCase()}-${Date.now()}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao gerar relatório PDF', details: error.message });
  }
});

// Generate Excel report for city
router.get('/excel/:city', async (req, res) => {
  try {
    const { city } = req.params;

    let accommodations, analysis;
    
    if (!global.mongoConnected) {
      // Use mock data
      accommodations = generateMockAccommodations(city, 50);
      analysis = generateMockAnalysis(city);
    } else {
      [accommodations, analysis] = await Promise.all([
        Accommodation.find({ city: new RegExp(city, 'i'), isActive: true }).lean(),
        MarketAnalysis.findOne({ city: new RegExp(city, 'i') }).sort({ analysisDate: -1 }),
      ]);
    }

    if (accommodations.length === 0) {
      return res.status(404).json({ error: 'Nenhuma hospedagem encontrada para esta cidade' });
    }

    // Create workbook
    const wb = xlsx.utils.book_new();

    // Sheet 1: Accommodations
    const accommodationsData = accommodations.map((acc) => ({
      Nome: acc.name,
      Tipo: acc.type,
      Cidade: acc.city,
      Bairro: acc.neighborhood || 'N/A',
      'Preço Atual': acc.currentPrice,
      'Nota': acc.rating?.score || 'N/A',
      'Total Avaliações': acc.rating?.totalReviews || 0,
      'Disponível': acc.availability.isAvailable ? 'Sim' : 'Não',
      'Taxa Ocupação': acc.availability.occupancyRate || 'N/A',
      'Plataforma': acc.source.platform,
      'Última Atualização': new Date(acc.lastScrapedAt).toLocaleDateString('pt-BR'),
    }));

    const ws1 = xlsx.utils.json_to_sheet(accommodationsData);
    xlsx.utils.book_append_sheet(wb, ws1, 'Hospedagens');

    // Sheet 2: Summary
    const summaryData = [
      { Métrica: 'Total de Hospedagens', Valor: accommodations.length },
      {
        Métrica: 'Preço Médio',
        Valor: `R$ ${(accommodations.reduce((sum, acc) => sum + acc.currentPrice, 0) / accommodations.length).toFixed(2)}`,
      },
      {
        Métrica: 'Avaliação Média',
        Valor: accommodations.filter((a) => a.rating?.score).reduce((sum, acc, _, arr) => sum + acc.rating.score / arr.length, 0).toFixed(1),
      },
      {
        Métrica: 'Hospedagens Disponíveis',
        Valor: accommodations.filter((acc) => acc.availability.isAvailable).length,
      },
    ];

    const ws2 = xlsx.utils.json_to_sheet(summaryData);
    xlsx.utils.book_append_sheet(wb, ws2, 'Resumo');

    // Sheet 3: Analysis (if available)
    if (analysis) {
      const analysisData = [
        { Categoria: 'Demanda', Item: 'Nível', Valor: analysis.demandAnalysis.level },
        { Categoria: 'Demanda', Item: 'Tendência', Valor: analysis.demandAnalysis.trend },
        { Categoria: 'Demanda', Item: 'Score', Valor: analysis.demandAnalysis.score },
        { Categoria: 'Preços', Item: 'Média', Valor: `R$ ${analysis.priceAnalysis.averagePrice?.toFixed(2) || 'N/A'}` },
        { Categoria: 'Preços', Item: 'Mediana', Valor: `R$ ${analysis.priceAnalysis.medianPrice?.toFixed(2) || 'N/A'}` },
        { Categoria: 'Preços', Item: 'Mínimo', Valor: `R$ ${analysis.priceAnalysis.minPrice?.toFixed(2) || 'N/A'}` },
        { Categoria: 'Preços', Item: 'Máximo', Valor: `R$ ${analysis.priceAnalysis.maxPrice?.toFixed(2) || 'N/A'}` },
        { Categoria: 'Ocupação', Item: 'Taxa Média', Valor: `${analysis.occupancyAnalysis.occupancyRate?.toFixed(1) || analysis.occupancyAnalysis.average?.toFixed(1) || 'N/A'}%` },
      ];

      const ws3 = xlsx.utils.json_to_sheet(analysisData);
      xlsx.utils.book_append_sheet(wb, ws3, 'Análise');
    }

    // Generate buffer
    const excelBuffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=relatorio-${city.toLowerCase()}-${Date.now()}.xlsx`);
    res.send(excelBuffer);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao gerar relatório Excel', details: error.message });
  }
});

// Get report summary for city
router.get('/summary/:city', async (req, res) => {
  try {
    const { city } = req.params;

    let accommodations;
    
    if (!global.mongoConnected) {
      accommodations = generateMockAccommodations(city, 50);
    } else {
      accommodations = await Accommodation.find({
        city: new RegExp(city, 'i'),
        isActive: true,
      }).lean();
    }

    if (accommodations.length === 0) {
      return res.status(404).json({ error: 'Nenhuma hospedagem encontrada para esta cidade' });
    }

    const summary = {
      city,
      generatedAt: new Date(),
      totalAccommodations: accommodations.length,
      statistics: {
        price: {
          average: (accommodations.reduce((sum, acc) => sum + acc.currentPrice, 0) / accommodations.length).toFixed(2),
          min: Math.min(...accommodations.map((acc) => acc.currentPrice)),
          max: Math.max(...accommodations.map((acc) => acc.currentPrice)),
        },
        rating: {
          average: accommodations.filter((a) => a.rating?.score).reduce((sum, acc, _, arr) => sum + acc.rating.score / arr.length, 0).toFixed(1),
          totalReviews: accommodations.reduce((sum, acc) => sum + (acc.rating?.totalReviews || 0), 0),
        },
        availability: {
          available: accommodations.filter((acc) => acc.availability.isAvailable).length,
          occupied: accommodations.filter((acc) => !acc.availability.isAvailable).length,
          rate: ((accommodations.filter((acc) => acc.availability.isAvailable).length / accommodations.length) * 100).toFixed(1),
        },
      },
      byType: {},
    };

    // Group by type
    accommodations.forEach((acc) => {
      if (!summary.byType[acc.type]) {
        summary.byType[acc.type] = { count: 0, avgPrice: 0, totalPrice: 0 };
      }
      summary.byType[acc.type].count++;
      summary.byType[acc.type].totalPrice += acc.currentPrice;
    });

    Object.keys(summary.byType).forEach((type) => {
      summary.byType[type].avgPrice = (summary.byType[type].totalPrice / summary.byType[type].count).toFixed(2);
      delete summary.byType[type].totalPrice;
    });

    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao gerar resumo', details: error.message });
  }
});

export default router;
