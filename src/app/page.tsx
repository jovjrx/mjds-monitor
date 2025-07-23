'use client';

import { useState } from 'react';
import SiteStatusTable from '../components/SiteStatusTable';
import SiteForm from '../components/SiteForm';
import TipoForm from '../components/TipoForm';
import Configuracao from '../components/Configuracao';

export default function Home() {
  const [intervalSeconds, setIntervalSeconds] = useState(60);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSiteAdded = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleTipoAdded = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleIntervalChange = (seconds: number) => {
    setIntervalSeconds(seconds);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            MJDS Monitor
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Sistema de monitoramento de sites com verificação de CDN e status em tempo real
          </p>
        </header>

        {/* Configurações */}
        <div className="mb-8">
          <Configuracao 
            intervalSeconds={intervalSeconds} 
            onIntervalChange={handleIntervalChange} 
          />
        </div>

        {/* Formulários */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <SiteForm onSiteAdded={handleSiteAdded} />
          </div>
          <div>
            <TipoForm onTipoAdded={handleTipoAdded} />
          </div>
        </div>

        {/* Tabela de Monitoramento */}
        <div key={refreshKey}>
          <SiteStatusTable intervalSeconds={intervalSeconds} />
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>
            MJDS Monitor - Sistema de monitoramento desenvolvido com Next.js e TypeScript
          </p>
        </footer>
      </div>
    </div>
  );
} 