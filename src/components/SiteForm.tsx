'use client';

import { useState, useEffect } from 'react';
import { Tipo } from '../../utils/verificarSite';

interface SiteFormProps {
  onSiteAdded: () => void;
  onClose: () => void;
}

export default function SiteForm({ onSiteAdded, onClose }: SiteFormProps) {
  const [url, setUrl] = useState('');
  const [nome, setNome] = useState('');
  const [tipoId, setTipoId] = useState('');
  const [tipos, setTipos] = useState<Tipo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const carregarTipos = async () => {
    try {
      const response = await fetch('/api/tipos');
      const data = await response.json();

      if (data.success) {
        setTipos(data.data);
        if (data.data.length > 0) {
          setTipoId(data.data[0].id);
        }
      } else {
        setError('Erro ao carregar tipos');
      }
    } catch (err) {
      console.error('Erro ao carregar tipos:', err);
      setError('Erro ao conectar com o servidor');
    }
  };

  useEffect(() => {
    carregarTipos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!url || !nome || !tipoId) {
      setError('Todos os campos são obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/sites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, nome, tipoId }),
      });

      const data = await response.json();

      if (data.success) {
        setUrl('');
        setNome('');
        setTipoId(tipos[0]?.id || '');
        onSiteAdded();
        onClose();
      } else {
        setError(data.error || 'Erro ao adicionar site');
      }
    } catch (err) {
      console.error('Erro ao adicionar site:', err);
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div>
        <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-2">
          Nome do Site *
        </label>
        <input
          type="text"
          id="nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
          placeholder="Ex: Google"
          required
        />
      </div>

      <div>
        <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
          URL *
        </label>
        <input
          type="url"
          id="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
          placeholder="https://www.exemplo.com"
          required
        />
      </div>

      <div>
        <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-2">
          Tipo *
        </label>
        <select
          id="tipo"
          value={tipoId}
          onChange={(e) => setTipoId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
          required
        >
          {tipos.length === 0 ? (
            <option value="">Carregando tipos...</option>
          ) : (
            tipos.map((tipo) => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nome}
              </option>
            ))
          )}
        </select>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading || tipos.length === 0}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Adicionando...
            </span>
          ) : (
            'Adicionar Site'
          )}
        </button>
      </div>
    </form>
  );
}
