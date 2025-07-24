'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Alert,
  AlertIcon,
  useColorModeValue,
  IconButton,
  Tooltip,
  Collapse,
  useDisclosure,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  TableContainer,
} from '@chakra-ui/react';
import { ExternalLinkIcon, EditIcon, ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { SiteStatus, Tipo } from '../../utils/verificarSite';
import OfflineHistory from './OfflineHistory';
import OfflineSitesModal from './OfflineSitesModal';

interface SiteStatusTableProps {
  intervalSeconds: number;
  onEditSite: (siteId: string) => void;
  onRefresh: () => void;
  loading: boolean;
  lastUpdate: string;
  error: string;
}

interface OfflineStats {
  totalIncidents: number;
  currentOffline: number;
  totalOfflineTime: number;
  averageDowntime: number;
}

export default function SiteStatusTable({
  intervalSeconds,
  onEditSite,
  onRefresh,
  loading,
  lastUpdate,
  error
}: SiteStatusTableProps) {
  const [monitoramento, setMonitoramento] = useState<Record<string, SiteStatus>>({});
  const [tipos, setTipos] = useState<Tipo[]>([]);
  const [offlineStats, setOfflineStats] = useState<OfflineStats | null>(null);
  const [offlineHistory, setOfflineHistory] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { isOpen, onToggle } = useDisclosure();
  const {
    isOpen: isOfflineModalOpen,
    onOpen: onOfflineModalOpen,
    onClose: onOfflineModalClose
  } = useDisclosure();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const headerBg = useColorModeValue('gray.50', 'gray.700');

  const obterNomeTipo = (tipoId: string) => {
    const tipo = tipos.find(t => t.id === tipoId);
    return tipo?.nome || 'Desconhecido';
  };

  const obterStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return '🟢';
      case 'offline': return '🔴';
      case 'rate_limited': return '⚠️';
      default: return '❓';
    }
  };

  const obterStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'green';
      case 'offline': return 'red';
      case 'rate_limited': return 'yellow';
      default: return 'gray';
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

  const abrirSite = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const carregarHistorico = async () => {
    try {
      const response = await fetch('/api/historico?limit=50');
      const data = await response.json();

      if (data.success) {
        setOfflineHistory(data.data);
        setOfflineStats(data.stats);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const verificarSites = async () => {
    try {
      const response = await fetch('/api/verificar');
      const data = await response.json();

      if (data.success) {
        const monitoramentoObj: Record<string, SiteStatus> = {};

        if (Array.isArray(data.data)) {
          data.data.forEach((site: SiteStatus) => {
            monitoramentoObj[site.id] = site;
          });
        }

        setMonitoramento(monitoramentoObj);

        // Atualizar estatísticas
        if (data.offlineStats) {
          setOfflineStats(data.offlineStats);
        }
        if (data.currentOfflineSites) {
          setOfflineHistory(data.currentOfflineSites);
        }

        // Atualizar última verificação se for verificação automática
        if (data.timestamp) {
          // Chamar onRefresh para atualizar o timestamp no header
          onRefresh();
        }
      }
    } catch (error) {
      console.error('Erro ao verificar sites:', error);
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
      }
    } catch (error) {
      console.error('Erro ao carregar monitoramento:', error);
    }
  };

  useEffect(() => {
    carregarTipos();
    carregarMonitoramento();
    carregarHistorico();
    // Verificação automática ao carregar
    verificarSites();
  }, []);

  useEffect(() => {
    const interval = setInterval(verificarSites, intervalSeconds * 1000);
    return () => clearInterval(interval);
  }, [intervalSeconds]);

  const sites = Object.values(monitoramento);
  const sitesOffline = sites.filter(site => site.status === 'offline' || site.status === 'rate_limited');

  // Filtrar sites por tipo dinamicamente
  const sitesPorTipo = tipos.map(tipo => ({
    tipo,
    sites: sites.filter(site => site.tipoId === tipo.id)
  }));

  // Componente da tabela reutilizável
  const SiteTable = ({ sitesToShow }: { sitesToShow: SiteStatus[] }) => (
    <Box flex="1" h="100%" display="flex" flexDirection="column">
      <Box flex="1" overflow="auto" minH="0">
        <Table variant="striped" size="md" minW="1200px">
          <Thead position="sticky" top={0} zIndex={10} bg={headerBg}>
            <Tr>
              <Th minW="200px" p={1} px={2}>Site</Th>
              <Th minW="120px" p={1} px={2} textAlign={'center'}>Status</Th>
              <Th minW="120px" p={1} px={2} textAlign={'center'}>Tipo</Th>
              <Th minW="120px" p={1} px={2} textAlign={'center'}>Frontdoor</Th>
              <Th minW="120px" p={1} px={2} textAlign={'center'}>Cache</Th>
              <Th minW="150px" p={1} px={2}>CDN</Th>
              <Th minW="120px" p={1} px={2} textAlign={'center'}>Tempo</Th>
              <Th minW="150px" p={1} px={2} textAlign={'center'}>Verificação</Th>
              <Th minW="100px" position="sticky" textAlign={'center'} p={1} px={2} right={0} bg={headerBg}>Ações</Th>
            </Tr>
          </Thead>
          <Tbody>
            {sitesToShow.sort((a, b) => a.nome.localeCompare(b.nome)).map((site) => (
              <Tr key={site.id} _hover={{ bg: 'gray.50' }}>
                <Td minW="200px" p={1} px={2} textAlign={'center'}>
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="medium" fontSize={'sm'}>{site.nome}</Text>
                    <Text fontSize="xs" color={'gray.500'} noOfLines={1}>
                      {site.url}
                    </Text>
                  </VStack>
                </Td>
                <Td minW="120px" p={1} px={2} textAlign={'center'}>
                  <VStack align="center" spacing={1}>
                    <HStack spacing={2}>

                      <Badge
                        rounded={'lg'}
                        colorScheme={obterStatusColor(site.status)}
                        variant="subtle"
                      >
                        {site.status === 'online' ? '✅ Online' :
                          site.status === 'offline' ? '❌ Offline' : '⚠️ Rate Limited'}
                      </Badge>
                    </HStack>
                    {site.statusCode > 0 && (
                      <Text fontSize="xs" color={'gray.500'}>
                        HTTP {site.statusCode}
                      </Text>
                    )}
                  </VStack>
                </Td>
                <Td minW="120px" p={1} px={2} textAlign={'center'}>
                  <Badge rounded={'lg'} colorScheme="blue" variant="subtle">
                    {obterNomeTipo(site.tipoId)}
                  </Badge>
                </Td>
                <Td minW="120px" p={1} px={2} textAlign={'center'}>
                  <Badge
                    rounded={'lg'}
                    colorScheme={site.isAzureFrontDoor ? 'green' : 'gray'}
                    variant="subtle"
                  >
                    {site.isAzureFrontDoor ? '✅ Sim' : '❌ Não'}
                  </Badge>
                </Td>
                <Td minW="120px" p={1} px={2} textAlign={'center'}>
                  <VStack align="center" spacing={1}>
                    <Badge rounded={'lg'}
                      colorScheme={site.isUsingCache ? 'green' : 'gray'}
                      variant="subtle"
                    >
                      {site.isUsingCache ? '✅ Ativo' : '❌ Inativo'}
                    </Badge>
                    {site.cacheAge !== undefined && (
                      <Text fontSize="xs" color={'gray.500'}>
                        Idade: {formatarTempoCache(site.cacheAge)}
                      </Text>
                    )}
                    {site.cacheMaxAge !== undefined && (
                      <Text fontSize="xs" color={'gray.500'}>
                        Max: {formatarTempoCache(site.cacheMaxAge)}
                      </Text>
                    )}
                  </VStack>
                </Td>
                <Td minW="150px" p={1} px={2} textAlign={'center'}>
                  {site.cdnVersion ? (
                    <VStack align="start" spacing={1}>
                      <Badge
                        rounded={'lg'}
                        colorScheme={site.cdnVersion === 'Padrão' ? 'gray' : 'purple'}
                        variant="subtle"
                      >
                        {site.cdnVersion}
                      </Badge>
                      {site.cdnLink && (
                        <Text fontSize="xs" color={'gray.500'} noOfLines={1}>
                          {site.cdnLink}
                        </Text>
                      )}
                    </VStack>
                  ) : (
                    <Text color={'gray.500'}>-</Text>
                  )}
                </Td>
                <Td minW="120px" p={1} px={2} textAlign={'center'}>
                  <Text
                    fontFamily="mono"
                    color={
                      site.responseTime < 1000 ? 'green.500' :
                        site.responseTime < 3000 ? 'yellow.500' : 'red.500'
                    }
                  >
                    {formatarTempo(site.responseTime)}
                  </Text>
                </Td>
                <Td minW="150px" textAlign={'center'}>
                  <Text fontSize="sm">
                    {formatarData(site.lastChecked)}
                  </Text>
                </Td>
                <Td minW="100px" position="sticky" p={1} px={2} textAlign={'center'} right={0} bg={'white'}>
                  <HStack spacing={2} justify="center">
                    <Tooltip label="Abrir Site">
                      <IconButton
                        aria-label="Abrir site"
                        icon={<ExternalLinkIcon />}
                        onClick={() => abrirSite(site.url)}
                        size="sm"
                        colorScheme="blue"
                        variant="ghost"
                      />
                    </Tooltip>
                    <Tooltip label="Editar Site">
                      <IconButton
                        aria-label="Editar site"
                        icon={<EditIcon />}
                        onClick={() => onEditSite(site.id)}
                        size="sm"
                        colorScheme="gray"
                        variant="ghost"
                      />
                    </Tooltip>
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );

  return (
    <Box h="calc(100vh - 160px)" display="flex" flexDirection="column">
      <audio ref={audioRef} preload="auto">
        <source src="/alerta.mp3" type="audio/mpeg" />
      </audio>

      {sitesOffline.length > 0 && (
        <Alert
          status="error"
          borderRadius="lg"
          bg={'red.50'}
          border="1px"
          borderColor={'red.100'}
          mb={4}
        >
          <AlertIcon />
          <Box flex="1">
            <Text fontWeight="medium" color={'red.800'}>
              {sitesOffline.length} site(s) offline detectado(s)
            </Text>
            <Text fontSize="sm" color={'red.300'}>
              Clique em "Ver Sites Offline" para mais detalhes
            </Text>
          </Box>
          <Button
            size="sm"
            colorScheme="red"
            variant="outline"
            onClick={onOfflineModalOpen}
          >
            Ver Sites Offline
          </Button>
        </Alert>
      )}

      <Box
        bg={bgColor}
        borderRadius="md"
        boxShadow="sm"
        border="1px"
        borderColor={borderColor}
        flex="1"
        display="flex"
        flexDirection="column"
        overflow="hidden"
      >
        {sites.length === 0 ? (
          <Box
            flex="1"
            display="flex"
            alignItems="center"
            justifyContent="center"
            p={12}
            textAlign="center"
          >
            <VStack spacing={4}>
              <Box color={'gray.500'}>
                <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </Box>
              <Text fontSize="lg" fontWeight="medium" color={'gray.900'}>
                Nenhum site monitorado
              </Text>
              <Text color={'gray.500'}>
                Adicione sites para começar o monitoramento automático.
              </Text>
            </VStack>
          </Box>
        ) : (
          <Tabs
            index={selectedTab}
            onChange={setSelectedTab}
            flex="1"
            display="flex"
            variant={'solid-rounded'}
            flexDirection="column"
            overflow="hidden"
            h="100%"
          >
            <TabList p={2} bg={bgColor} borderColor={borderColor}>
              {sitesPorTipo.map(({ tipo, sites: sitesDoTipo }, index) => (
                <Tab key={tipo.id} rounded={'md'}>
                  <Text fontSize="sm">{tipo.nome} ({sitesDoTipo.length})</Text>
                </Tab>
              ))}
            </TabList>

            <TabPanels flex="1" overflow="hidden" h="calc(100% - 60px)">
              {sitesPorTipo.map(({ tipo, sites: sitesDoTipo }) => (
                <TabPanel key={tipo.id} p={0} h="100%">
                  <SiteTable sitesToShow={sitesDoTipo} />
                </TabPanel>
              ))}
            </TabPanels>
          </Tabs>
        )}
      </Box>

      {/* Modal de Sites Offline */}
      <OfflineSitesModal
        isOpen={isOfflineModalOpen}
        onClose={onOfflineModalClose}
        sitesOffline={sitesOffline}
        onEditSite={onEditSite}
      />
    </Box>
  );
} 