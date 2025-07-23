'use client';

import { useState } from 'react';

interface ConfiguracaoProps {
  intervalSeconds: number;
  onIntervalChange: (seconds: number) => void;
  onClose: () => void;
}

export default function Configuracao({ intervalSeconds, onIntervalChange, onClose }: ConfiguracaoProps) {
  const [alertaSonoro, setAlertaSonoro] = useState(true);

  const handleIntervalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newInterval = parseInt(e.target.value);
    onIntervalChange(newInterval);
  };

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="interval" className="block text-sm font-medium text-gray-700 mb-2">
          Intervalo de Verificação
        </label>
        <select
          id="interval"
          value={intervalSeconds}
          onChange={handleIntervalChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-white text-gray-900"
        >
          <option value={30}>30 segundos</option>
          <option value={60}>1 minuto</option>
          <option value={300}>5 minutos</option>
          <option value={600}>10 minutos</option>
          <option value={1800}>30 minutos</option>
          <option value={3600}>1 hora</option>
        </select>
        <p className="text-sm text-gray-500 mt-1">Intervalo atual: {intervalSeconds} segundos</p>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Alertas</h4>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={alertaSonoro}
              onChange={(e) => setAlertaSonoro(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Alerta sonoro quando site ficar offline</span>
          </label>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-3 flex items-center">
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          Informações do Sistema
        </h4>
        <ul className="text-sm text-blue-700 space-y-2">
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            <span>O monitoramento é automático e verifica todos os sites ativos</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            <span>Status: 🟢 Online, 🔴 Offline, ⚠️ Frontdoor</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            <span>A verificação manual pode ser feita a qualquer momento</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            <span>Os dados são salvos localmente em arquivos JSON</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            <span>Alerta sonoro toca quando um site muda de online para offline</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            <span>Detecção automática de Azure Front Door e cache</span>
          </li>
        </ul>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900">🟢</div>
          <div className="text-sm text-gray-600">Online</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900">🔴</div>
          <div className="text-sm text-gray-600">Offline</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900">⚠️</div>
          <div className="text-sm text-gray-600">Frontdoor</div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}
