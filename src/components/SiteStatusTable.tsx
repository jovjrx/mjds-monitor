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
  useColorModeValue,
  IconButton,
  Tooltip,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Spinner,
  Progress,
  Link,
} from '@chakra-ui/react';
import { ExternalLinkIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { SiteStatus } from '@/utils/verificarSite';

interface SiteStatusTableProps {
  intervalSeconds: number;
  onEditSite: (siteId: string) => Promise<void>;
  onDeleteSite: (siteId: string) => Promise<void>;
  onRefresh: () => void;
  onMonitoramentoUpdate: (monitoramento: Record<string, SiteStatus>) => void;
  possuiOffline: boolean;
  slowTimeout: number;
  offlineTimeout: number;
  sites: any[];
  tipos: any[];
  monitoramento: Record<string, SiteStatus>;
  dataLoading: boolean;
  primeiraVerificacao: boolean;
  progresso: any;
  editingLoading: string;
  siteVerificando: string;
}

export default function SiteStatusTable({
  onEditSite,
  onDeleteSite,
  possuiOffline,
  slowTimeout,
  offlineTimeout,
  monitoramento,
  sites,
  tipos,
  dataLoading,
  primeiraVerificacao,
  progresso,
  editingLoading,
  siteVerificando,
}: SiteStatusTableProps) {

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const tableTextColor = useColorModeValue('gray.600', 'gray.400');
  const emptyIconColor = useColorModeValue('gray.400', 'gray.500');
  const emptyTitleColor = useColorModeValue('gray.600', 'gray.300');
  const emptyTextColor = useColorModeValue('gray.500', 'gray.400');
  const badgeTipo = useColorModeValue('blue', 'blue');

  const obterNomeTipo = (tipo_id: number) => {
    const tipo = tipos.find(t => t.id === tipo_id);
    return tipo ? tipo.nome : 'Desconhecido';
  };

  const obterStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'green';
      case 'offline':
        return 'red';
      case 'slow':
        return 'yellow';
      case 'rate_limited':
        return 'orange';
      case 'verificando':
        return 'blue';
      case 'aguardando':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const obterStatusText = (status: string) => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'offline':
        return 'Offline';
      case 'slow':
        return 'Lento';
      case 'rate_limited':
        return 'Rate Limited';
      case 'verificando':
        return 'Verificando';
      case 'aguardando':
        return 'Aguardando';
      default:
        return 'Aguardando';
    }
  };

  const formatarTempo = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatarData = (dataString: string) => {
    return new Date(dataString).toLocaleString('pt-BR');
  };

  const formatarTempoCache = (segundos: number) => {
    if (segundos < 60) return `${segundos}s`;
    if (segundos < 3600) return `${Math.floor(segundos / 60)}m`;
    return `${Math.floor(segundos / 3600)}h`;
  };

  const sitesComStatus = sites.map(site => {
    const status = monitoramento[site.id];
    if (status) {
      return status;
    }
    // Se não há status, cria um status básico
    return {
      id: site.id,
      url: site.url,
      nome: site.nome,
      tipo_id: site.tipo_id,
      status: 'aguardando' as const,
      statusCode: 0,
      responseTime: 0,
      lastChecked: '',
      error: 'Não verificado'
    };
  });

  const sitesPorTipo = tipos.map(tipo => ({
    tipo,
    sites: sitesComStatus.filter(site => site.tipo_id == tipo.id)
  }));

  const SiteTable = ({ sitesToShow }: { sitesToShow: SiteStatus[] }) => (
    <Box flex="1" h="100%" display="flex" flexDirection="column">
      <Box flex="1" overflow="auto" minH="0">
        <Table variant="striped" size="md" minW="1200px">
          <Thead position="sticky" top={0} zIndex={10} bg={bgColor} borderColor={borderColor}>
            <Tr>
              <Th minW="240px" p={1} px={2}>Site</Th>
              <Th minW="120px" p={1} px={2} textAlign={'center'}>Status</Th>
              <Th minW="120px" p={1} px={2} textAlign={'center'}>Tipo</Th>
              <Th minW="120px" p={1} px={2} textAlign={'center'}>Frontdoor</Th>
              <Th minW="120px" p={1} px={2} textAlign={'center'}>Cache</Th>
              <Th minW="150px" p={1} px={2}>CDN</Th>
              <Th minW="120px" p={1} px={2} textAlign={'center'}>Tempo</Th>
              <Th minW="150px" p={1} px={2} textAlign={'center'}>Verificação</Th>
              <Th minW="100px" position="sticky" bg={bgColor} borderColor={borderColor} textAlign={'center'} p={1} px={2} right={0}>Ações</Th>
            </Tr>
          </Thead>
          <Tbody>
            {sitesToShow.sort((a, b) => a.nome.localeCompare(b.nome)).map((site) => (
              <Tr key={site.id}>
                <Td minW="200px" p={1} px={2} textAlign={'center'}>
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="medium" fontSize={'sm'}>{site.nome}</Text>
                    <Link href={site.url} target="_blank" rel="noopener noreferrer" color={tableTextColor}>
                      <Text fontSize="xs" color={tableTextColor} noOfLines={1}>
                        {site.url}
                      </Text>
                    </Link>
                  </VStack>
                </Td>
                <Td minW="120px" p={1} px={2} textAlign={'center'}>
                  <VStack align="center" spacing={1}>
                    <HStack spacing={1}>
                      <Badge
                        rounded={'lg'}
                        colorScheme={obterStatusColor(site.status)}
                        variant="subtle"
                      >
                        {obterStatusText(site.status)}
                      </Badge>
                      {siteVerificando === site.id && (
                        <Spinner size="xs" color="blue.500" />
                      )}
                    </HStack>
                    {site.statusCode > 0 && siteVerificando !== site.id && (
                      <Text fontSize="xs" color={tableTextColor}>
                        HTTP {site.statusCode}
                      </Text>
                    )}
                  </VStack>
                </Td>
                <Td minW="120px" p={1} px={2} textAlign={'center'}>
                  <Badge rounded={'lg'} colorScheme={badgeTipo} variant="subtle">
                    {obterNomeTipo(site.tipo_id)}
                  </Badge>
                </Td>
                <Td minW="120px" p={1} px={2} textAlign={'center'}>
                  {primeiraVerificacao && !site.isAzureFrontDoor && !site.isUsingCache ? (
                    <Text color={tableTextColor}>-</Text>
                  ) : (
                    <Badge
                      rounded={'lg'}
                      colorScheme={site.isAzureFrontDoor ? 'green' : 'red'}
                      variant="subtle"
                    >
                      {site.isAzureFrontDoor ? 'Ativo' : 'Inativo'}
                    </Badge>
                  )}
                </Td>
                <Td minW="120px" p={1} px={2} textAlign={'center'}>
                  {primeiraVerificacao && !site.isAzureFrontDoor && !site.isUsingCache ? (
                    <Text color={tableTextColor}>-</Text>
                  ) : (
                    <VStack align="center" spacing={1}>
                      <Badge rounded={'lg'}
                        colorScheme={site.isUsingCache ? 'green' : 'red'}
                        variant="subtle"
                      >
                        {site.isUsingCache ? 'Ativo' : 'Inativo'}
                      </Badge>
                      {site.cacheAge !== undefined && (
                        <Text fontSize="xs" color={tableTextColor}>
                          Idade: {formatarTempoCache(site.cacheAge)}
                        </Text>
                      )}
                      {site.cacheMaxAge !== undefined && (
                        <Text fontSize="xs" color={tableTextColor}>
                          Max: {formatarTempoCache(site.cacheMaxAge)}
                        </Text>
                      )}
                    </VStack>
                  )}
                </Td>
                <Td minW="150px" p={1} px={2} textAlign={'center'}>
                  {primeiraVerificacao && !site.isAzureFrontDoor && !site.isUsingCache ? (
                    <Text color={tableTextColor}>-</Text>
                  ) : site?.cdnVersion ? (
                    <VStack align="start" spacing={1}>
                      <Badge
                        rounded={'lg'}
                        colorScheme={site.cdnVersion === 'Padrão' ? 'green' : 'purple'}
                        variant="subtle"
                      >
                        {site.cdnVersion}
                      </Badge>
                      {site.cdnLink && (
                        <Text fontSize="xs" color={tableTextColor} noOfLines={1}>
                          {site.cdnVersion === 'Padrão'
                            ? new URL(site.cdnLink).origin
                            : site.cdnLink}
                        </Text>
                      )}
                    </VStack>
                  ) : (
                    <Text color={tableTextColor}>-</Text>
                  )}
                </Td>
                <Td minW="120px" p={1} px={2} textAlign={'center'}>
                  {primeiraVerificacao && !site.isAzureFrontDoor && !site.isUsingCache ? (
                    <Text color={tableTextColor}>-</Text>
                  ) : (
                    <Text
                      fontFamily="mono"
                      color={
                        site.responseTime < slowTimeout ? 'green.500' :
                          site.responseTime < offlineTimeout ? 'yellow.500' : 'red.500'
                      }
                    >
                      {formatarTempo(site.responseTime)}
                    </Text>
                  )}
                </Td>
                <Td minW="150px" textAlign={'center'}>
                  {primeiraVerificacao && !site.isAzureFrontDoor && !site.isUsingCache ? (
                    <Text color={tableTextColor}>-</Text>
                  ) : (
                    <Text fontSize="sm">
                      {formatarData(site.lastChecked)}
                    </Text>
                  )}
                </Td>
                <Td minW="100px" position="sticky" bg={bgColor} borderColor={borderColor} p={1} px={2} textAlign={'center'} right={0}>
                  <HStack spacing={2} justify="center">
                    <Tooltip label="Abrir Site">
                      <IconButton
                        aria-label="Abrir site"
                        icon={<ExternalLinkIcon />}
                        onClick={() => window.open(site.url, '_blank', 'noopener,noreferrer')}
                        size="sm"
                        colorScheme="blue"
                        variant="ghost"
                      />
                    </Tooltip>
                    <Tooltip label="Editar Site">
                      <IconButton
                        aria-label="Editar site"
                        icon={editingLoading === site.id ? <Spinner size="sm" /> : <EditIcon />}
                        onClick={() => onEditSite(site.id)}
                        size="sm"
                        colorScheme="gray"
                        variant="ghost"
                        isLoading={editingLoading === site.id}
                        isDisabled={editingLoading !== ''}
                      />
                    </Tooltip>
                    <Tooltip label="Excluir Site">
                      <IconButton
                        aria-label="Excluir site"
                        icon={<DeleteIcon />}
                        onClick={() => onDeleteSite(site.id)}
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        isDisabled={editingLoading !== ''}
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
    <Box h={possuiOffline ? "calc(100vh - 168px)" : "calc(100vh - 90px)"} display="flex" flexDirection="column">
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
        {dataLoading ? (
          <Box
            flex="1"
            display="flex"
            alignItems="center"
            justifyContent="center"
            p={12}
            textAlign="center"
          >
            <VStack spacing={4}>
              <Spinner size="md"  />
              <Text fontSize="lg" fontWeight="medium" color={emptyTitleColor}>
                Carregando dados...
              </Text>
              <Text color={emptyTextColor}>
                Aguarde enquanto os dados são carregados.
              </Text>
            </VStack>
          </Box>
        ) : sites.length === 0 ? (
          <Box
            flex="1"
            display="flex"
            alignItems="center"
            justifyContent="center"
            p={12}
            textAlign="center"
          >
            <VStack spacing={4}>
              <Box color={emptyIconColor}>
                <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </Box>
              <Text fontSize="lg" fontWeight="medium" color={emptyTitleColor}>
                Nenhum site monitorado
              </Text>
              <Text color={emptyTextColor}>
                Adicione sites para começar o monitoramento automático.
              </Text>
              <Text fontSize="xs" color="gray.500">
                Debug: Sites={sites.length}, ComStatus={sites.length}, Tipos={tipos.length}
              </Text>
            </VStack>
          </Box>
        ) : (
          <Tabs
            flex="1"
            colorScheme="blue"
            display="flex"
            variant={'solid-rounded'}
            flexDirection="column"
            overflow="hidden"
            h="100%"
          >
            <TabList p={2} bg={bgColor} borderColor={borderColor}>
              {sitesPorTipo.sort((a, b) => a.tipo.id - b.tipo.id).map(({ tipo, sites: sitesDoTipo }, index) => (
                <Tab key={tipo.id} rounded={'md'}>
                  <Text fontSize={{ base: 'xs', md: 'sm' }}>{tipo.nome} ({sitesDoTipo.length})</Text>
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

    </Box>
  );
} 