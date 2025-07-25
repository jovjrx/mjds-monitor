'use client';

import { useState, useEffect } from 'react';

export default function DebugInfo() {
  const [debugData, setDebugData] = useState<any>({});

  const carregarDadosDebug = async () => {
    try {
      const sitesResponse = await fetch('/api/sites');
      const sitesData = await sitesResponse.json();
      
      const tiposResponse = await fetch('/api/tipos');
      const tiposData = await tiposResponse.json();
        
      const monitoramentoResponse = await fetch('/api/monitoramento');
      const monitoramentoData = await monitoramentoResponse.json();
      
      setDebugData({
        sites: sitesData,
        tipos: tiposData,
        monitoramento: monitoramentoData,
        timestamp: new Date().toLocaleString('pt-BR')
      });
    } catch (error) {
      console.error('Erro ao carregar dados de debug:', error);
    }
  };

  useEffect(() => {
    carregarDadosDebug();
  }, []);

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-yellow-800">Debug Info</h3>
        <button
          onClick={carregarDadosDebug}
          className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
        >
          Atualizar
        </button>
      </div>
      
      <div className="space-y-3 text-sm">
        <div>
          <strong>Sites:</strong> {debugData.sites?.success ? '✅' : '❌'} 
          {debugData.sites?.data?.length || 0} sites encontrados
        </div>
        <div>
          <strong>Tipos:</strong> {debugData.tipos?.success ? '✅' : '❌'} 
          {debugData.tipos?.data?.length || 0} tipos encontrados
        </div>
        <div>
          <strong>Monitoramento:</strong> {debugData.monitoramento?.success ? '✅' : '❌'} 
          {Object.keys(debugData.monitoramento?.data || {}).length} registros
        </div>
        <div>
          <strong>Última atualização:</strong> {debugData.timestamp}
        </div>
      </div>
      
      {debugData.sites?.error && (
        <div className="mt-3 p-2 bg-red-100 border border-red-200 rounded text-red-700 text-xs">
          <strong>Erro Sites:</strong> {debugData.sites.error}
        </div>
      )}
      
      {debugData.tipos?.error && (
        <div className="mt-3 p-2 bg-red-100 border border-red-200 rounded text-red-700 text-xs">
          <strong>Erro Tipos:</strong> {debugData.tipos.error}
        </div>
      )}
      
      {debugData.monitoramento?.error && (
        <div className="mt-3 p-2 bg-red-100 border border-red-200 rounded text-red-700 text-xs">
          <strong>Erro Monitoramento:</strong> {debugData.monitoramento.error}
        </div>
      )}
    </div>
  );
} 