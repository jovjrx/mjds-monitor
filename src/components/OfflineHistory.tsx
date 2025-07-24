'use client';

import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  useColorModeValue,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Alert,
  AlertIcon,
  IconButton,
  Tooltip,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
} from '@chakra-ui/react';
import { ExternalLinkIcon, EditIcon, RepeatIcon } from '@chakra-ui/icons';

interface OfflineHistoryProps {
  history: any[];
  stats: any;
  onRefresh: () => void;
  onEditSite: (siteId: string) => void;
}

export default function OfflineHistory({ history, stats, onRefresh, onEditSite }: OfflineHistoryProps) {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const headerBg = useColorModeValue('gray.50', 'gray.700');

  const formatarData = (dataString: string) => {
    return new Date(dataString).toLocaleString('pt-BR');
  };

  const formatarDuracao = (segundos: number) => {
    if (segundos < 60) return `${segundos}s`;
    if (segundos < 3600) return `${Math.floor(segundos / 60)}m ${segundos % 60}s`;
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    return `${horas}h ${minutos}m`;
  };

  const abrirSite = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (history.length === 0) {
    return (
      <Box
        bg={bgColor}
        borderRadius="lg"
        boxShadow="sm"
        border="1px"
        borderColor={borderColor}
        p={8}
        textAlign="center"
      >
        <VStack spacing={4}>
          <Box color={'green.500'}>
            <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </Box>
          <Heading size="md">
            Nenhum incidente registrado
          </Heading>
          <Text>
            Todos os sites estão funcionando normalmente.
          </Text>
        </VStack>
      </Box>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Header com estatísticas */}
      <Box
        bg={bgColor}
        borderRadius="lg"
        boxShadow="sm"
        border="1px"
        borderColor={borderColor}
        p={6}
      >
        <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'stretch', md: 'center' }} gap={4}>
          <VStack align="start" spacing={2}>
            <Heading size="lg">
              Histórico de Sites Offline
            </Heading>
            <Text fontSize="sm">
              Registro de todos os incidentes de disponibilidade
            </Text>
          </VStack>
          
          <Tooltip label="Atualizar Histórico">
            <IconButton
              aria-label="Atualizar"
              icon={<RepeatIcon />}
              onClick={onRefresh}
              colorScheme="blue"
              size="sm"
            />
          </Tooltip>
        </Flex>
      </Box>

      {/* Estatísticas */}
      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
        <Stat
          bg={bgColor}
          p={4}
          borderRadius="lg"
          border="1px"
          borderColor={borderColor}
        >
          <StatLabel>Total de Incidentes</StatLabel>
          <StatNumber color="red.500">{stats.totalIncidents}</StatNumber>
          <StatHelpText>Registros de downtime</StatHelpText>
        </Stat>
        <Stat
          bg={bgColor}
          p={4}
          borderRadius="lg"
          border="1px"
          borderColor={borderColor}
        >
          <StatLabel>Atualmente Offline</StatLabel>
          <StatNumber color="orange.500">{stats.currentOffline}</StatNumber>
          <StatHelpText>Sites ainda offline</StatHelpText>
        </Stat>
        <Stat
          bg={bgColor}
          p={4}
          borderRadius="lg"
          border="1px"
          borderColor={borderColor}
        >
          <StatLabel>Tempo Total Offline</StatLabel>
          <StatNumber color="purple.500">{formatarDuracao(stats.totalOfflineTime)}</StatNumber>
          <StatHelpText>Tempo acumulado</StatHelpText>
        </Stat>
        <Stat
          bg={bgColor}
          p={4}
          borderRadius="lg"
          border="1px"
          borderColor={borderColor}
        >
          <StatLabel>Tempo Médio</StatLabel>
          <StatNumber color="blue.500">{formatarDuracao(stats.averageDowntime)}</StatNumber>
          <StatHelpText>Por incidente</StatHelpText>
        </Stat>
      </SimpleGrid>

      {/* Alertas para sites ainda offline */}
      {stats.currentOffline > 0 && (
        <Alert
          status="error"
          borderRadius="lg"
          bg={'red.500'}
          border="1px"
          borderColor={'red.700'}
        >
          <AlertIcon />
          <Box>
            <Text fontWeight="medium" color={'red.800'}>
              ⚠️ Atenção: {stats.currentOffline} site(s) ainda offline
            </Text>
            <Text fontSize="sm" color={'red.300'}>
              Verifique a tabela abaixo para mais detalhes
            </Text>
          </Box>
        </Alert>
      )}

      {/* Tabela de Histórico */}
      <Box
        bg={bgColor}
        borderRadius="lg"
        boxShadow="sm"
        border="1px"
        borderColor={borderColor}
        overflow="hidden"
      >
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead bg={headerBg}>
              <Tr>
                <Th>Site</Th>
                <Th>Status</Th>
                <Th>Ficou Offline</Th>
                <Th>Voltou Online</Th>
                <Th>Duração</Th>
                <Th>HTTP Code</Th>
                <Th>Ações</Th>
              </Tr>
            </Thead>
            <Tbody>
              {history.map((record) => (
                <Tr key={record.id} _hover={{ bg: 'gray.50' }}>
                  <Td>
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="medium">{record.siteName}</Text>
                      <Text fontSize="sm" color={'gray.500'} noOfLines={1}>
                        {record.url}
                      </Text>
                    </VStack>
                  </Td>
                  <Td>
                    {record.wentOnlineAt ? (
                      <Badge colorScheme="green" variant="subtle">
                        Resolvido
                      </Badge>
                    ) : (
                      <Badge colorScheme="red" variant="subtle">
                        Ainda Offline
                      </Badge>
                    )}
                  </Td>
                  <Td>
                    <Text fontSize="sm">
                      {formatarData(record.wentOfflineAt)}
                    </Text>
                  </Td>
                  <Td>
                    {record.wentOnlineAt ? (
                      <Text fontSize="sm">
                        {formatarData(record.wentOnlineAt)}
                      </Text>
                    ) : (
                      <Text fontSize="sm" color={'gray.500'}>
                        -
                      </Text>
                    )}
                  </Td>
                  <Td>
                    {record.duration ? (
                      <Badge colorScheme="red" variant="subtle">
                        {formatarDuracao(record.duration)}
                      </Badge>
                    ) : (
                      <Badge colorScheme="orange" variant="subtle">
                        Em andamento
                      </Badge>
                    )}
                  </Td>
                  <Td>
                    {record.statusCode ? (
                      <Text fontSize="sm" fontFamily="mono">
                        {record.statusCode}
                      </Text>
                    ) : (
                      <Text fontSize="sm" color={'gray.500'}>
                        -
                      </Text>
                    )}
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <Tooltip label="Abrir Site">
                        <IconButton
                          aria-label="Abrir site"
                          icon={<ExternalLinkIcon />}
                          onClick={() => abrirSite(record.url)}
                          size="sm"
                          colorScheme="blue"
                          variant="ghost"
                        />
                      </Tooltip>
                      <Tooltip label="Editar Site">
                        <IconButton
                          aria-label="Editar site"
                          icon={<EditIcon />}
                          onClick={() => onEditSite(record.siteId)}
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
    </VStack>
  );
} 