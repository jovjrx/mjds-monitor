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
import { useState, useEffect } from 'react';

interface OfflineSitesModalProps {
  isOpen: boolean;
  onClose: () => void;
  sitesOffline: SiteStatus[];
  onMarcarComoVisto: (siteId: string) => void;
}

// Remover funções utilitárias de sessionStorage (agora gerenciado no componente pai)

export default function OfflineSitesModal({
  isOpen,
  onClose,
  sitesOffline,
  onMarcarComoVisto,
}: OfflineSitesModalProps) {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');

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

  // Remover estados e useEffects relacionados ao sessionStorage

  return (
    <Modal isOpen={isOpen && sitesOffline.length > 0} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent bg={bgColor}>
        <ModalHeader borderBottom="1px" borderColor={borderColor}>
          <HStack spacing={3}>
            <Text fontSize="lg" fontWeight="bold" color="red.500">
              Sites Offline
            </Text>
            <Badge colorScheme="red" rounded="lg" px={2} variant="solid" size={'md'} fontSize="xs">
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
                    <HStack spacing={2} pt={2} justify="space-between" w="full" align="center">
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
                      {(site as any).visto ? (
                        <Badge colorScheme="green" p={1.5} rounded="lg" px={2} variant="subtle" fontSize="sm">Visto</Badge>
                      ) : (
                        <Button
                          size="sm"
                          colorScheme="green"
                          variant="outline"
                          onClick={() => onMarcarComoVisto(site.id)}
                        >
                          Marcar como visto
                        </Button>
                      )}
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