import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Accommodations from './pages/Accommodations';
import AccommodationDetail from './pages/AccommodationDetail';
import Analysis from './pages/Analysis';
import Comparison from './pages/Comparison';
import CategoryComparison from './pages/CategoryComparison';
import Reports from './pages/Reports';
import Scraping from './pages/Scraping';

function App() {
  return (
    <AppProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/hospedagens" element={<Accommodations />} />
            <Route path="/hospedagens/:id" element={<AccommodationDetail />} />
            <Route path="/analise" element={<Analysis />} />
            <Route path="/comparacao" element={<Comparison />} />
            <Route path="/comparacao-categoria" element={<CategoryComparison />} />
            <Route path="/coleta" element={<Scraping />} />
            <Route path="/relatorios" element={<Reports />} />
          </Routes>
        </Layout>
      </Router>
    </AppProvider>
  );
}

export default App;
