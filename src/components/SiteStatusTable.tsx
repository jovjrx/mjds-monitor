'use client';

import { useState, useEffect, useRef } from 'react';
import { SiteStatus, Tipo } from '../../utils/verificarSite';

interface SiteStatusTableProps {
  intervalSeconds: number;
}

export default function SiteStatusTable({ intervalSeconds }: SiteStatusTableProps) {
  const [monitoramento, setMonitoramento] = useState<Record<string, SiteStatus>>({});
  const [tipos, setTipos] = useState<Tipo[]>([]);
  const [selectedTipo, setSelectedTipo] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [previousStatus, setPreviousStatus] = useState<Record<string, string>>({});
  const [error, setError] = useState<string>('');
  const audioRef = useRef<HTMLAudioElement>(null);

  const obterNomeTipo = (tipoId: string) => {
    const tipo = tipos.find(t => t.id === tipoId);
    return tipo?.nome || 'Desconhecido';
  };

  const obterStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return '🟢';
      case 'offline': return '🔴';
      case 'frontdoor': return '⚠️';
      default: return '❓';
    }
  };

  const formatarTempo = (ms: number) => {
    return `${ms}ms`;
  };

  const formatarData = (dataString: string) => {
    return new Date(dataString).toLocaleString('pt-BR');
  };

  const formatarTempoCache = (segundos: number) => {
    if (segundos < 60) return `${segundos}s`;
    if (segundos < 3600) return `${Math.floor(segundos / 60)}m`;
    return `${Math.floor(segundos / 3600)}h`;
  };

  const tocarAlerta = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(console.error);
    }
  };

  const verificarSites = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/verificar');
      const data = await response.json();
      
      if (data.success) {
        const monitoramentoObj: Record<string, SiteStatus> = {};
        const novosStatus: Record<string, string> = {};
        
        if (Array.isArray(data.data)) {
          data.data.forEach((site: SiteStatus) => {
            monitoramentoObj[site.id] = site;
            novosStatus[site.id] = site.status;
            
            // Verificar se o status mudou de online para offline
            const statusAnterior = previousStatus[site.id];
            if (statusAnterior === 'online' && site.status === 'offline') {
              tocarAlerta();
            }
          });
        }
        
        setMonitoramento(monitoramentoObj);
        setPreviousStatus(novosStatus);
        setLastUpdate(new Date().toLocaleString('pt-BR'));
      } else {
        setError(data.error || 'Erro na verificação');
      }
    } catch (error) {
      console.error('Erro ao verificar sites:', error);
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const carregarTipos = async () => {
    try {
      const response = await fetch('/api/tipos');
      const data = await response.json();
      
      if (data.success) {
        setTipos(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar tipos:', error);
    }
  };

  const carregarMonitoramento = async () => {
    try {
      const response = await fetch('/api/monitoramento');
      const data = await response.json();
      
      if (data.success) {
        setMonitoramento(data.data);
        // Inicializar status anteriores
        const statusIniciais: Record<string, string> = {};
        Object.values(data.data).forEach((site: any) => {
          statusIniciais[site.id] = site.status;
        });
        setPreviousStatus(statusIniciais);
      }
    } catch (error) {
      console.error('Erro ao carregar monitoramento:', error);
    }
  };

  useEffect(() => {
    carregarTipos();
    carregarMonitoramento();
    verificarSites();
  }, []);

  useEffect(() => {
    const interval = setInterval(verificarSites, intervalSeconds * 1000);
    return () => clearInterval(interval);
  }, [intervalSeconds, previousStatus]);

  const sites = Object.values(monitoramento)
    .filter(site => selectedTipo === 'all' || site.tipoId === selectedTipo)
    .sort((a, b) => a.nome.localeCompare(b.nome));

  return (
    <div className="space-y-6">
      {/* Áudio para alerta */}
      <audio ref={audioRef} preload="auto">
        <source src="/alerta.mp3" type="audio/mpeg" />
      </audio>

      {/* Header com informações */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Monitoramento de Sites
            </h2>
            <p className="text-sm text-gray-600">
              Última atualização: {lastUpdate || 'Nunca'}
            </p>
            {error && (
              <p className="text-sm text-red-600 mt-1">
                Erro: {error}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={tocarAlerta}
              className="px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm"
              title="Testar Alerta Sonoro"
            >
              🔊 Testar Alerta
            </button>
            <button
              onClick={verificarSites}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Verificando...
                </span>
              ) : (
                'Verificar Agora'
              )}
            </button>
            <select
              value={selectedTipo}
              onChange={e => setSelectedTipo(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white text-gray-900"
            >
              <option value="all">Todos</option>
              {tipos.map(tipo => (
                <option key={tipo.id} value={tipo.id}>{tipo.nome}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabela de Status */}
      {sites.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum site monitorado
          </h3>
          <p className="text-gray-500">
            Adicione sites para começar o monitoramento automático.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Site
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Azure FD
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cache
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CDN
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tempo de Resposta
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Última Verificação
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sites.map((site) => (
                  <tr key={site.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{site.nome}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{site.url}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">{obterStatusIcon(site.status)}</span>
                        <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                          site.status === 'online' ? 'bg-green-100 text-green-800' :
                          site.status === 'offline' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {site.status === 'online' ? 'Online' :
                           site.status === 'offline' ? 'Offline' : 'Frontdoor'}
                        </span>
                      </div>
                      {site.statusCode > 0 && (
                        <div className="text-xs text-gray-500 mt-1">HTTP {site.statusCode}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {obterNomeTipo(site.tipoId)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {site.isAzureFrontDoor ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          ✅ Sim
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          ❌ Não
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {site.isUsingCache ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✅ Ativo
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            ❌ Inativo
                          </span>
                        )}
                        {site.cacheAge !== undefined && (
                          <div className="text-xs text-gray-500">
                            Idade: {formatarTempoCache(site.cacheAge)}
                          </div>
                        )}
                        {site.cacheMaxAge !== undefined && (
                          <div className="text-xs text-gray-500">
                            Max: {formatarTempoCache(site.cacheMaxAge)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {site.cdnVersion ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {site.cdnVersion}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`font-mono ${
                        site.responseTime < 1000 ? 'text-green-600' :
                        site.responseTime < 3000 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {formatarTempo(site.responseTime)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatarData(site.lastChecked)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 