'use client';

import { useState, useEffect } from 'react';
import { Box, Container, VStack, useColorModeValue } from '@chakra-ui/react';
import Header from '../components/Header';
import SiteStatusTable from '../components/SiteStatusTable';
import Modal from '../components/Modal';
import Configuracao from '../components/Configuracao';
import SiteForm from '../components/SiteForm';
import TipoForm from '../components/TipoForm';

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

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.600', 'gray.400');

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
        // Usar o timestamp retornado pela API
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

  return (
    <Box minH="100vh" bg={bgColor} display="flex" flexDirection="column">
      <Header
        onConfigClick={() => setShowConfig(true)}
        onAddSiteClick={() => setShowSiteForm(true)}
        onAddTipoClick={() => setShowTipoForm(true)}
        onRefresh={handleRefresh}
        loading={loading}
        lastUpdate={lastUpdate}
        error={error}
      />

      <Container maxW="full" py={4}>
        <Box key={refreshKey} h="full">
          <SiteStatusTable 
            intervalSeconds={intervalSeconds} 
            onEditSite={handleEditSite}
            onRefresh={handleRefresh}
            loading={loading}
            lastUpdate={lastUpdate}
            error={error}
          />
        </Box>
      </Container>
      
      <Box
        as="footer"
        textAlign="center"
        py={{base: 2, md: 4}}
        borderTop="1px"
        borderColor={'gray.200'}
        bg={'white'}
      >
        <Box color={textColor} fontSize="sm">
          MJDS Monitor - Next.js + TypeScript + Chakra UI
        </Box>
      </Box>

      {/* Modal de Configuração */}
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

      {/* Modal de Adicionar Site */}
      <Modal
        isOpen={showSiteForm}
        onClose={() => setShowSiteForm(false)}
        title="Adicionar Site"
      >
        <SiteForm onClose={handleSiteFormClose} />
      </Modal>

      {/* Modal de Editar Site */}
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

      {/* Modal de Adicionar Tipo */}
      <Modal
        isOpen={showTipoForm}
        onClose={() => setShowTipoForm(false)}
        title="Adicionar Tipo"
      >
        <TipoForm onClose={() => setShowTipoForm(false)} />
      </Modal>
    </Box>
  );
}