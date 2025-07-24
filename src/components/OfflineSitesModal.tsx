'use client';

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Text,
  Badge,
  Box,
  useColorModeValue,
  Button,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { ExternalLinkIcon, EditIcon } from '@chakra-ui/icons';
import { SiteStatus } from '../../utils/verificarSite';

interface OfflineSitesModalProps {
  isOpen: boolean;
  onClose: () => void;
  sitesOffline: SiteStatus[];
  onEditSite: (siteId: string) => void;
}

export default function OfflineSitesModal({
  isOpen,
  onClose,
  sitesOffline,
  onEditSite,
}: OfflineSitesModalProps) {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');

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

  const formatarData = (dataString: string) => {
    return new Date(dataString).toLocaleString('pt-BR');
  };

  const abrirSite = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent bg={bgColor}>
        <ModalHeader borderBottom="1px" borderColor={borderColor}>
          <HStack spacing={3}>
            <Text fontSize="lg" fontWeight="bold" color="red.500">
              ⚠️ Sites Offline
            </Text>
            <Badge colorScheme="red" variant="solid" fontSize="sm">
              {sitesOffline.length} site(s)
            </Badge>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody py={6}>
          {sitesOffline.length === 0 ? (
            <Box textAlign="center" py={8}>
              <Text color={textColor} fontSize="lg">
                Nenhum site offline no momento
              </Text>
            </Box>
          ) : (
            <VStack spacing={4} align="stretch">
              {sitesOffline.map((site) => (
                <Box
                  key={site.id}
                  p={4}
                  border="1px"
                  borderColor={borderColor}
                  borderRadius="lg"
                  bg={'gray.50'}
                >
                  <VStack align="start" spacing={3}>
                    {/* Cabeçalho do site */}
                    <HStack justify="space-between" w="full">
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="bold" fontSize="lg">
                          {site.nome}
                        </Text>
                        <Text fontSize="sm" color={textColor} noOfLines={1}>
                          {site.url}
                        </Text>
                      </VStack>
                      <HStack spacing={2}>
                        <Text fontSize="lg">{obterStatusIcon(site.status)}</Text>
                        <Badge
                          colorScheme={obterStatusColor(site.status)}
                          variant="solid"
                        >
                          {site.status === 'online' ? 'Online' :
                           site.status === 'offline' ? 'Offline' : 'Rate Limited'}
                        </Badge>
                      </HStack>
                    </HStack>

                    {/* Detalhes do status */}
                    <HStack spacing={4} wrap="wrap">
                      {site.statusCode > 0 && (
                        <Badge colorScheme="gray" variant="outline">
                          HTTP {site.statusCode}
                        </Badge>
                      )}
                      {site.error && (
                        <Badge colorScheme="red" variant="outline">
                          Erro: {site.error}
                        </Badge>
                      )}
                    </HStack>

                    {/* Informações adicionais */}
                    <HStack spacing={4} fontSize="sm" color={textColor}>
                      <Text>
                        <strong>Última verificação:</strong> {formatarData(site.lastChecked)}
                      </Text>
                      {site.responseTime > 0 && (
                        <Text>
                          <strong>Tempo de resposta:</strong> {site.responseTime}ms
                        </Text>
                      )}
                    </HStack>

                    {/* Ações */}
                    <HStack spacing={2} pt={2}>
                      <Tooltip label="Abrir Site">
                        <IconButton
                          aria-label="Abrir site"
                          icon={<ExternalLinkIcon />}
                          onClick={() => abrirSite(site.url)}
                          size="sm"
                          colorScheme="blue"
                          variant="outline"
                        />
                      </Tooltip>
                      <Tooltip label="Editar Site">
                        <IconButton
                          aria-label="Editar site"
                          icon={<EditIcon />}
                          onClick={() => {
                            onEditSite(site.id);
                            onClose();
                          }}
                          size="sm"
                          colorScheme="gray"
                          variant="outline"
                        />
                      </Tooltip>
                    </HStack>
                  </VStack>
                </Box>
              ))}
            </VStack>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
} 