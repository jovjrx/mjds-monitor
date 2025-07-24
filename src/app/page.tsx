'use client';

import { useState, useEffect, useRef } from 'react';
import { Box, Container, VStack, useColorModeValue, Alert, AlertIcon, Text, Button } from '@chakra-ui/react';
import Header from '../components/Header';
import SiteStatusTable from '../components/SiteStatusTable';
import Modal from '../components/Modal';
import Configuracao from '../components/Configuracao';
import SiteForm from '../components/SiteForm';
import TipoForm from '../components/TipoForm';
import OfflineSitesModal from '@/components/OfflineSitesModal';
import { SiteStatus } from '../../utils/verificarSite';

// Funções utilitárias para localStorage (persiste entre refreshes)
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

// Função para limpar quando sair da janela
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
  const [refreshKey, setRefreshKey] = useState(0);
  const [intervalSeconds, setIntervalSeconds] = useState(60);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [error, setError] = useState<string>('');
  
  // Estados para sites offline
  const [monitoramento, setMonitoramento] = useState<Record<string, SiteStatus>>({});
  const [showOfflineSites, setShowOfflineSites] = useState(false);

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  // Adicionar event listener para limpar quando sair da janela
  useEffect(() => {
    const handleBeforeUnload = () => {
      clearOfflineSeenOnUnload();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Função para marcar como visto
  const marcarComoVisto = (siteId: string) => {
    const currentSeen = getOfflineSeen();
    if (!currentSeen.includes(siteId)) {
      const newSeen = [...currentSeen, siteId];
      setOfflineSeen(newSeen);
      // Forçar re-render
      setMonitoramento({ ...monitoramento });
    }
  };

  // Sites offline com propriedade visto
  const sitesOffline = Object.values(monitoramento)
    .filter(site => site.status === 'offline' || site.status === 'rate_limited')
    .map(site => ({
      ...site,
      visto: getOfflineSeen().includes(site.id)
    }));

  // Sites offline não vistos
  const sitesOfflineNaoVistos = sitesOffline.filter(site => !site.visto);

  // Variáveis de cor para o alerta
  const alertText = useColorModeValue('red.800', 'red.200');
  const alertSubText = useColorModeValue('red.600', 'red.300');

  const handleEditSite = (siteId: string) => {
    setEditingSiteId(siteId);
    setShowEditSite(true);
  };

  const handleSiteFormClose = () => {
    setShowSiteForm(false);
    setShowEditSite(false);
    setEditingSiteId('');
    setRefreshKey(prev => prev + 1);
  };

  const handleIntervalChange = (newInterval: number) => {
    setIntervalSeconds(newInterval);
  };

  const handleRefresh = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/verificar');
      const data = await response.json();

      if (data.success) {
        if (data.timestamp) {
          setLastUpdate(new Date(data.timestamp).toLocaleString('pt-BR'));
        } else {
          setLastUpdate(new Date().toLocaleString('pt-BR'));
        }
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

  // Função para atualizar monitoramento (chamada pelo SiteStatusTable)
  const handleMonitoramentoUpdate = (newMonitoramento: Record<string, SiteStatus>) => {
    setMonitoramento(newMonitoramento);
  };

  return (
    <Box minH="100vh" bg={bgColor} display="flex" flexDirection="column">
      <Header
        onConfigClick={() => setShowConfig(true)}
        onAddSiteClick={() => setShowSiteForm(true)}
        onAddTipoClick={() => setShowTipoForm(true)}
        onRefresh={handleRefresh}
        onVerSitesOffline={() => setShowOfflineSites(true)}
        loading={loading}
        lastUpdate={lastUpdate}
        error={error}
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
              onClick={() => setShowOfflineSites(true)}
            >
              Ver Sites Offline
            </Button>
          </Alert>
        )}
        
        <Box key={refreshKey} h="full">
          <SiteStatusTable
            intervalSeconds={intervalSeconds}
            onEditSite={handleEditSite}
            onRefresh={handleRefresh}
            sitesOffline={sitesOfflineNaoVistos}
            onMonitoramentoUpdate={handleMonitoramentoUpdate}
            loading={loading}
            lastUpdate={lastUpdate}
            error={error}
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
          onClose={() => setShowConfig(false)}
        />
      </Modal>

      <Modal
        isOpen={showSiteForm}
        onClose={() => setShowSiteForm(false)}
        title="Adicionar Site"
      >
        <SiteForm onClose={handleSiteFormClose} />
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

      {/* Modal de Sites Offline */}
      <OfflineSitesModal
      
        isOpen={showOfflineSites}
        onClose={() => setShowOfflineSites(false)}
        sitesOffline={sitesOffline}
        onMarcarComoVisto={marcarComoVisto}
      />
    </Box>
  );
}