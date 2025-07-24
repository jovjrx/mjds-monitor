'use client';

import { useEffect, useState } from 'react';
import { Box, Container, useColorModeValue } from '@chakra-ui/react';
import Header from '../components/Header';
import OfflineHistory from '../components/OfflineHistory';

export default function HistoricoPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState('');

  const carregarHistorico = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/historico');
      const data = await res.json();
      if (data.success) {
        setHistory(data.data);
        setStats(data.stats);
        setLastUpdate(new Date().toLocaleString('pt-BR'));
      } else {
        setError(data.error || 'Erro');
      }
    } catch (e) {
      console.error('Erro ao carregar histórico', e);
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarHistorico();
  }, []);

  const bgColor = useColorModeValue('gray.50', 'gray.900');

  return (
    <Box minH="100vh" bg={bgColor}>
      <Header
        onConfigClick={() => {}}
        onAddSiteClick={() => {}}
        onAddTipoClick={() => {}}
        onRefresh={carregarHistorico}
        onVerSitesOffline={() => {}}
        loading={loading}
        lastUpdate={lastUpdate}
        error={error}
      />
      <Container maxW="6xl" py={4}>
        <OfflineHistory
          history={history}
          stats={stats}
          onRefresh={carregarHistorico}
          onEditSite={() => {}}
        />
      </Container>
    </Box>
  );
}
