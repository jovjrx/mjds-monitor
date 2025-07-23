'use client';

import { useState } from 'react';
import SiteStatusTable from '../components/SiteStatusTable';
import SiteForm from '../components/SiteForm';
import TipoForm from '../components/TipoForm';
import Configuracao from '../components/Configuracao';
import Modal from '../components/Modal';

export default function Home() {
  const [intervalSeconds, setIntervalSeconds] = useState(60);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showConfig, setShowConfig] = useState(false);
  const [showSiteForm, setShowSiteForm] = useState(false);
  const [showTipoForm, setShowTipoForm] = useState(false);

  const handleSiteAdded = () => {
    setRefreshKey(prev => prev + 1);
    setShowSiteForm(false);
  };

  const handleTipoAdded = () => {
    setRefreshKey(prev => prev + 1);
    setShowTipoForm(false);
  };

  const handleIntervalChange = (seconds: number) => {
    setIntervalSeconds(seconds);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <div className="container mx-auto px-4 py-6 space-y-6 flex-1">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">MJDS Monitor</h1>
          <div className="flex gap-3">
            <button
              onClick={() => setShowConfig(true)}
              className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
            >
              Configurar
            </button>
            <button
              onClick={() => setShowSiteForm(true)}
              className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              Adicionar Site
            </button>
            <button
              onClick={() => setShowTipoForm(true)}
              className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
            >
              Adicionar Tipo
            </button>
          </div>
        </div>

        <div key={refreshKey}>
          <SiteStatusTable intervalSeconds={intervalSeconds} />
        </div>
      </div>

      <footer className="text-center text-gray-500 text-xs p-4">
        MJDS Monitor - Next.js + TypeScript
      </footer>

      <Modal isOpen={showConfig} onClose={() => setShowConfig(false)} title="Configurações">
        <Configuracao
          intervalSeconds={intervalSeconds}
          onIntervalChange={handleIntervalChange}
          onClose={() => setShowConfig(false)}
        />
      </Modal>

      <Modal isOpen={showSiteForm} onClose={() => setShowSiteForm(false)} title="Adicionar Site">
        <SiteForm onSiteAdded={handleSiteAdded} onClose={() => setShowSiteForm(false)} />
      </Modal>

      <Modal isOpen={showTipoForm} onClose={() => setShowTipoForm(false)} title="Adicionar Tipo">
        <TipoForm onTipoAdded={handleTipoAdded} onClose={() => setShowTipoForm(false)} />
      </Modal>
    </div>
  );
}