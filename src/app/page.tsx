'use client';

import { useState, useEffect, useRef } from 'react';
import { Box, Container, VStack, useColorModeValue, Alert, AlertIcon, Text, Button, useDisclosure } from '@chakra-ui/react';
import Header from '../components/Header';
import SiteStatusTable from '../components/SiteStatusTable';
import Modal from '../components/Modal';
import Configuracao from '../components/Configuracao';
import SiteForm from '../components/SiteForm';
import TipoForm from '../components/TipoForm';
import OfflineSitesModal from '@/components/OfflineSitesModal';
import { SiteStatus } from '../../utils/verificarSite';

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
  const [refreshKey, setRefreshKey] = useState(0);
  const [intervalSeconds, setIntervalSeconds] = useState(180);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Estados para sites offline
  const [monitoramento, setMonitoramento] = useState<Record<string, SiteStatus>>({});
  const showProblems = useDisclosure();
  const audioRef = useRef<HTMLAudioElement>(null);
  const prevOfflineIdsRef = useRef<string[]>([]);

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  const [slowTimeout, setSlowTimeout] = useState(() => {
    if (typeof window !== 'undefined') {
      const v = localStorage.getItem('slowTimeout');
      return v ? parseInt(v) : 10000;
    }
    return 10000;
  });
  const [offlineTimeout, setOfflineTimeout] = useState(() => {
    if (typeof window !== 'undefined') {
      const v = localStorage.getItem('offlineTimeout');
      return v ? parseInt(v) : 20000;
    }
    return 20000;
  });

  useEffect(() => {
    localStorage.setItem('slowTimeout', String(slowTimeout));
  }, [slowTimeout]);
  useEffect(() => {
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
    .filter(site => site && (site.status === 'offline' || site.status === 'rate_limited'))
    .map(site => ({
      ...site,
      visto: getOfflineSeen().includes(site.id)
    }));

  useEffect(() => {
    const currentIds = sitesOffline.map(site => site.id);
    const novosOffline = currentIds.filter(id => !prevOfflineIdsRef.current.includes(id));
    if (novosOffline.length > 0 && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
    prevOfflineIdsRef.current = currentIds;
  }, [sitesOffline]);

  const sitesOfflineNaoVistos = sitesOffline.filter(site => !site.visto);

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

  const handleMonitoramentoUpdate = (newMonitoramento: Record<string, SiteStatus>) => {
    setMonitoramento(newMonitoramento);
  };

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
            intervalSeconds={intervalSeconds}
            onEditSite={handleEditSite}
            onRefresh={handleRefresh}
            onMonitoramentoUpdate={handleMonitoramentoUpdate}
            loading={loading}
            lastUpdate={lastUpdate}
            error={error}
            slowTimeout={slowTimeout}
            offlineTimeout={offlineTimeout}
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

      <OfflineSitesModal
        isOpen={showProblems.isOpen}
        onClose={showProblems.onClose}
        sitesOffline={sitesOffline}
        onMarcarComoVisto={marcarComoVisto}
      />
    </Box>
  );
}