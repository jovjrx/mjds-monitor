'use client';

import { useState, useEffect, useRef } from 'react';
import { Box, VStack, useDisclosure, useColorModeValue, Container, Alert, AlertIcon, Text, Button } from '@chakra-ui/react';
import Header from '@/components/Header';
import SiteStatusTable from '@/components/SiteStatusTable';
import SiteForm from '@/components/SiteForm';
import TipoForm from '@/components/TipoForm';
import Configuracao from '@/components/Configuracao';
import OfflineSitesModal from '@/components/OfflineSitesModal';
import Modal from '@/components/Modal';
import { SiteStatus } from '@/utils/verificarSite';

function getOfflineSeen(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem('offline_seen') || '[]');
  } catch {
    return [];
  }
}

function setOfflineSeen(ids: string[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('offline_seen', JSON.stringify(ids));
}

function clearOfflineSeenOnUnload() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('offline_seen');
}

export default function Home() {
  const [showConfig, setShowConfig] = useState(false);
  const [showSiteForm, setShowSiteForm] = useState(false);
  const [showTipoForm, setShowTipoForm] = useState(false);
  const [showEditSite, setShowEditSite] = useState(false);
  const [editingSiteId, setEditingSiteId] = useState<string>('');
  const [editingLoading, setEditingLoading] = useState<string>('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [intervalSeconds, setIntervalSeconds] = useState(300);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [progresso, setProgresso] = useState<{ atual: number; total: number; percentual: number } | null>(null);
  const [verificando, setVerificando] = useState(false);
  const [verificandoSite, setVerificandoSite] = useState(false);
  const [siteVerificando, setSiteVerificando] = useState<string>('');
  const [monitoramento, setMonitoramento] = useState<Record<string, SiteStatus>>({});
  const [sites, setSites] = useState<any[]>([]);
  const [tipos, setTipos] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [primeiraVerificacao, setPrimeiraVerificacao] = useState(true);
  const showProblems = useDisclosure();
  const audioRef = useRef<HTMLAudioElement>(null);
  const prevOfflineIdsRef = useRef<string[]>([]);

  const bgColor = useColorModeValue('gray.50', 'gray.900');

  const [slowTimeout, setSlowTimeout] = useState(() => {
    if (typeof window !== 'undefined') {
      const v = sessionStorage.getItem('slowTimeout') || localStorage.getItem('slowTimeout');
      const valor = v ? parseInt(v) : 10000;
      return valor;
    }
    return 10000;
  });
  
  const [offlineTimeout, setOfflineTimeout] = useState(() => {
    if (typeof window !== 'undefined') {
      const v = sessionStorage.getItem('offlineTimeout') || localStorage.getItem('offlineTimeout');
      const valor = v ? parseInt(v) : 30000;
      return valor;
    }
    return 30000;
  });

  useEffect(() => {
    sessionStorage.setItem('slowTimeout', String(slowTimeout));
    localStorage.setItem('slowTimeout', String(slowTimeout));
  }, [slowTimeout]);
  
  useEffect(() => {
    sessionStorage.setItem('offlineTimeout', String(offlineTimeout));
    localStorage.setItem('offlineTimeout', String(offlineTimeout));
  }, [offlineTimeout]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      clearOfflineSeenOnUnload();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const marcarComoVisto = (siteId: string) => {
    const currentSeen = getOfflineSeen();
    if (!currentSeen.includes(siteId)) {
      const newSeen = [...currentSeen, siteId];
      setOfflineSeen(newSeen);
      setMonitoramento({ ...monitoramento });
    }
  };

  const sitesOffline = Object.values(monitoramento || {})
    .filter(site => site && site.status === 'offline')
    .map(site => ({
      ...site,
      visto: getOfflineSeen().includes(site.id)
    }));

  console.log('📊 Sites offline detectados:', {
    total: sitesOffline.length,
    sites: sitesOffline.map(s => ({ id: s.id, nome: s.nome, visto: s.visto }))
  });

  useEffect(() => {
    const currentIds = sitesOffline.map(site => site.id);
    const novosOffline = currentIds.filter(id => !prevOfflineIdsRef.current.includes(id));
    
    console.log('🔍 Verificando alertas:', {
      sitesOffline: sitesOffline.length,
      novosOffline: novosOffline.length,
      primeiraVerificacao,
      audioRef: !!audioRef.current
    });
    
    if (novosOffline.length > 0 && audioRef.current && !primeiraVerificacao) {
      console.log('🚨 ALERTA: Sites offline detectados:', novosOffline);
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((error) => {
        console.error('❌ Erro ao tocar alerta sonoro:', error);
      });
    }
    
    prevOfflineIdsRef.current = currentIds;
  }, [sitesOffline, primeiraVerificacao]);

  const sitesOfflineNaoVistos = sitesOffline.filter(site => !site.visto);

  const alertText = useColorModeValue('red.800', 'red.200');
  const alertSubText = useColorModeValue('red.600', 'red.300');

  const handleEditSite = async (siteId: string) => {
    setEditingLoading(siteId);
    
    try {
      const response = await fetch('/api/sites');
      const data = await response.json();
      
      if (data.success) {
        const site = data.data.find((s: any) => s.id === siteId);
        if (site) {
          setEditingSiteId(siteId);
          setShowEditSite(true);
        } else {
          setError('Site não encontrado');
        }
      } else {
        setError('Erro ao carregar dados do site');
      }
    } catch (error) {
      console.error('Erro ao carregar site:', error);
      setError('Erro ao carregar dados do site');
    } finally {
      setEditingLoading('');
    }
  };

  const handleDeleteSite = async (siteId: string) => {
    if (!confirm('Tem certeza que deseja excluir este site?')) {
      return;
    }

    try {
      const response = await fetch(`/api/sites?id=${siteId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setSites(prev => prev.filter(site => site.id !== siteId));
        setMonitoramento(prev => {
          const newMonitoramento = { ...prev };
          delete newMonitoramento[siteId];
          return newMonitoramento;
        });
      } else {
        setError(data.error || 'Erro ao excluir site');
      }
    } catch (error) {
      console.error('Erro ao excluir site:', error);
      setError('Erro ao excluir site');
    }
  };

  const handleSiteFormClose = async () => {
    setShowSiteForm(false);
    setShowEditSite(false);
    setEditingSiteId('');
    
    await carregarSites();
    
    let siteParaVerificar: any = null;
    
    if (editingSiteId) {
      siteParaVerificar = sites.find(site => site.id === editingSiteId);
    } else {
      if (sites.length > 0) {
        siteParaVerificar = sites[sites.length - 1];
      }
    }
    
    if (siteParaVerificar) {
      setSiteVerificando(siteParaVerificar.id);
      
      try {
        const verificarResponse = await fetch('/api/verificar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ siteId: siteParaVerificar.id })
        });
        
        const verificarData = await verificarResponse.json();
        
        if (verificarData.success) {
          setMonitoramento(prev => ({
            ...prev,
            [siteParaVerificar.id]: verificarData.data
          }));
        }
      } catch (error) {
        console.error(`❌ Erro ao verificar site ${siteParaVerificar.nome}:`, error);
      } finally {
        setSiteVerificando('');
      }
    }
    
    setRefreshKey(prev => prev + 1);
  };

  const handleIntervalChange = (newInterval: number) => {
    setIntervalSeconds(newInterval);
  };

  const handleRefresh = async () => {
    setLoading(true);
    setError('');

    try {
      await verificarSitesIndividualmente();  
    } catch (error) {
      console.error('❌ Erro ao verificar sites:', error);
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const verificarSitesIndividualmente = async () => {
    if (verificando) {
      return;
    }
    
    setVerificando(true);
    setError('');
    
    try {
      const response = await fetch('/api/sites');
      const data = await response.json();
      
      if (!data.success) {
        throw new Error('Erro ao carregar sites');
      }
      
      const sites = data.data.sort((a: any, b: any) => {
        if (a.tipo_id !== b.tipo_id) {
          return a.tipo_id - b.tipo_id;
        }
        return a.nome.localeCompare(b.nome);
      });
      
      setProgresso({ atual: 0, total: sites.length, percentual: 0 });
      
      const resultados: Record<string, SiteStatus> = {};
      
      for (let i = 0; i < sites.length; i++) {
        const site = sites[i];
        
        setSiteVerificando(site.id);
        
        // Mantém dados anteriores e só muda o status para "verificando"
        setMonitoramento(prev => ({
          ...prev,
          [site.id]: {
            ...(prev[site.id] || {}), // Mantém dados anteriores se existirem
            id: site.id,
            url: site.url,
            nome: site.nome,
            tipo_id: site.tipo_id,
            status: 'verificando' as const,
            lastChecked: new Date().toISOString()
          }
        }));
        
        try {
          const verificarResponse = await fetch('/api/verificar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ siteId: site.id })
          });
          
          const verificarData = await verificarResponse.json();
          
          let resultadoSite: SiteStatus;
          if (verificarData.success) {
            resultadoSite = verificarData.data;
          } else {
            resultadoSite = {
              id: site.id,
              url: site.url,
              nome: site.nome,
              tipo_id: site.tipo_id,
              status: 'aguardando' as const,
              statusCode: 0,
              responseTime: 0,
              lastChecked: new Date().toISOString(),
              error: 'Erro na verificação'
            };
          }
          
          setMonitoramento(prev => ({
            ...prev,
            [site.id]: resultadoSite
          }));
          
          resultados[site.id] = resultadoSite;
        } catch (error) {
          console.error(`Erro ao verificar site ${site.nome}:`, error);
          const resultadoSite: SiteStatus = {
            id: site.id,
            url: site.url,
            nome: site.nome,
            tipo_id: site.tipo_id,
            status: 'aguardando' as const,
            statusCode: 0,
            responseTime: 0,
            lastChecked: new Date().toISOString(),
            error: 'Erro na verificação'
          };
          
          setMonitoramento(prev => ({
            ...prev,
            [site.id]: resultadoSite
          }));
          
          resultados[site.id] = resultadoSite;
        }

        setSiteVerificando('');
        
        setProgresso(prev => {
          if (!prev) return { atual: i + 1, total: sites.length, percentual: Math.round(((i + 1) / sites.length) * 100) };
          return {
            ...prev,
            atual: i + 1,
            percentual: Math.round(((i + 1) / sites.length) * 100)
          };
        });
      }
      
      setLastUpdate(new Date().toLocaleString('pt-BR'));
      
    } catch (error) {
      console.error('❌ Erro na verificação:', error);
      setError('Erro ao verificar sites');
    } finally {
      setVerificando(false);
      setProgresso({ atual: 0, total: 0, percentual: 0 });
    }
  };

  const handleMonitoramentoUpdate = (newMonitoramento: Record<string, SiteStatus>) => {
    setMonitoramento(newMonitoramento);
  };

  const carregarTipos = async () => {
    try {
      const response = await fetch('/api/tipos');
      const data = await response.json();

      if (data.success) {
        setTipos(data.data);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar tipos:', error);
      setTipos([]);
    }
  };

  const carregarSites = async () => {
    try {
      const response = await fetch('/api/sites');
      const data = await response.json();

      if (data.success) {
        setSites(data.data);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar sites:', error);
      setSites([]);
    }
  };

  useEffect(() => {
    const carregarDados = async () => {
      setDataLoading(true);
      
      await Promise.all([
        carregarTipos(),
        carregarSites()
      ]);
      
      setDataLoading(false);
      
      if (primeiraVerificacao) {
        await verificarSitesIndividualmente();
        setPrimeiraVerificacao(false);
      } else {
      }
    };
    
    carregarDados();
    }, []);

  useEffect(() => {
    if (primeiraVerificacao || sites.length === 0) return;

    const interval = setInterval(async () => {
      await verificarSitesIndividualmente();
    }, intervalSeconds * 1000);

    return () => {  
      clearInterval(interval);
    };
  }, [intervalSeconds, primeiraVerificacao, sites.length]);

  return (
    <Box minH="100vh" bg={bgColor} display="flex" flexDirection="column">
      <audio ref={audioRef} preload="auto">
        <source src="/alerta.mp3" type="audio/mpeg" />
      </audio>

      <Header 
        onConfigClick={() => setShowConfig(true)}
        onAddSiteClick={() => setShowSiteForm(true)}
        onAddTipoClick={() => setShowTipoForm(true)}
        onRefresh={handleRefresh}
        onVerSitesOffline={showProblems.onOpen}
        loading={loading}
        lastUpdate={lastUpdate}
        error={error}
        progresso={progresso}
        verificando={verificando}
        verificandoSite={verificandoSite}
      />

      <Container maxW="full" py={2}>
        {sitesOfflineNaoVistos.length > 0 && (
          <Alert
            status="error"
            borderRadius="lg"
            colorScheme={'red'}
            mb={2}
          >
            <AlertIcon />
            <Box flex="1">
              <Text fontWeight="medium" color={alertText}>
                {sitesOfflineNaoVistos.length} site(s) offline detectado(s)
              </Text>
              <Text fontSize="sm" color={alertSubText}>
                Clique em "Ver Sites Offline" para mais detalhes
              </Text>
            </Box>
            <Button
              size="sm"
              colorScheme="red"
              variant="solid"
              onClick={showProblems.onOpen}
            >
              Ver Sites Offline
            </Button>
          </Alert>
        )}

        <Box key={refreshKey} h="full">
          <SiteStatusTable 
            siteVerificando={siteVerificando}
            intervalSeconds={intervalSeconds}
            onEditSite={handleEditSite}
            onDeleteSite={handleDeleteSite}
            onRefresh={handleRefresh}
            onMonitoramentoUpdate={handleMonitoramentoUpdate}
            possuiOffline={sitesOfflineNaoVistos.length > 0}
            slowTimeout={slowTimeout}
            offlineTimeout={offlineTimeout}
            sites={sites}
            tipos={tipos}
            monitoramento={monitoramento}
            progresso={progresso}
            dataLoading={dataLoading}
            primeiraVerificacao={primeiraVerificacao}
            editingLoading={editingLoading}
          />
        </Box>
      </Container>

      <Modal
        isOpen={showConfig}
        onClose={() => setShowConfig(false)}
        title="Configurações"
      >
        <Configuracao
          intervalSeconds={intervalSeconds}
          onIntervalChange={handleIntervalChange}
          slowTimeout={slowTimeout}
          offlineTimeout={offlineTimeout}
          onSlowTimeoutChange={setSlowTimeout}
          onOfflineTimeoutChange={setOfflineTimeout}
          onClose={() => setShowConfig(false)}
        />
      </Modal>

      <Modal
        isOpen={showSiteForm}
        onClose={() => setShowSiteForm(false)}
        title="Adicionar Site"
      >
        <SiteForm 
          onClose={handleSiteFormClose} 
        />
      </Modal>

      <Modal
        isOpen={showEditSite}
        onClose={() => setShowEditSite(false)}
        title="Editar Site"
      >
        <SiteForm
          onClose={handleSiteFormClose}
          editingSiteId={editingSiteId}
        />
      </Modal>

      <Modal
        isOpen={showTipoForm}
        onClose={() => setShowTipoForm(false)}
        title="Adicionar Tipo"
      >
        <TipoForm onClose={() => setShowTipoForm(false)} />
      </Modal>

      <OfflineSitesModal
        isOpen={showProblems.isOpen}
        onClose={showProblems.onClose}
        sitesOffline={sitesOffline}
        onMarcarComoVisto={marcarComoVisto}
      />
    </Box>
  );
}