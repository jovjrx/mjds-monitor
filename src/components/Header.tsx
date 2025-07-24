'use client';

import { useState, useEffect } from 'react';
import { 
  Box, 
  Flex, 
  Button, 
  useDisclosure, 
  IconButton, 
  HStack, 
  Text, 
  useColorModeValue, 
  Container,
  VStack,
  Heading,
  Tooltip,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon, RepeatIcon, ViewIcon } from '@chakra-ui/icons';

interface HeaderProps {
  onConfigClick: () => void;
  onAddSiteClick: () => void;
  onAddTipoClick: () => void;
  onRefresh: () => void;
  loading: boolean;
  lastUpdate: string;
  error: string;
}

export default function Header({ 
  onConfigClick, 
  onAddSiteClick, 
  onAddTipoClick, 
  onRefresh, 
  loading, 
  lastUpdate, 
  error 
}: HeaderProps) {
  const { isOpen, onToggle } = useDisclosure();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  const tocarAlerta = () => {
    const audio = new Audio('/alerta.mp3');
    audio.currentTime = 0;
    audio.play().catch(console.error);
  };

  return (
    <Box
      bg={'blue.700'}
      borderBottom="1px"
      borderColor={borderColor}
      boxShadow="sm"
    >
      <Container maxW="full">
        <Flex align="center" justify="space-between" py={4}>
          <Flex align="center">
            <Heading size="lg" fontWeight={'light'} color={'white'}>
              MJDS Monitor
            </Heading>
          </Flex>

          <HStack spacing={2} display={{ base: 'none', md: 'flex' }}>
            <VStack align="start" spacing={1}>
              <Text fontSize="sm" color={'white'}>
                Últ. att: {lastUpdate || 'Nunca'}
              </Text>
              {error && (
                <Text fontSize="xs" color="red.500">
                  Erro: {error}
                </Text>
              )}
            </VStack>
            
            <Tooltip label="Testar Alerta Sonoro">
              <IconButton
                aria-label="Testar Alerta"
                icon={<ViewIcon />}
                colorScheme="yellow"
                onClick={tocarAlerta}
                size="sm"
              />
            </Tooltip>
            <Tooltip label="Verificar agora">
              <IconButton
                aria-label="Verificar"
                icon={<RepeatIcon />}
                colorScheme="green"
                onClick={onRefresh}
                isLoading={loading}
                size="sm"
              />
            </Tooltip>
            
            
            <Button onClick={onConfigClick} size="sm">
              Configurar
            </Button>
            <Button onClick={onAddSiteClick} colorScheme="blue" size="sm">
              Adicionar Site
            </Button>
            <Button onClick={onAddTipoClick} colorScheme="purple" size="sm">
              Adicionar Tipo
            </Button>
          </HStack>

          <IconButton
            display={{ base: 'flex', md: 'none' }}
            onClick={onToggle}
            size="sm"
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            variant="outline"
            colorScheme="whiteAlpha"
            aria-label="Abrir Menu"
          />
        </Flex>

        <Box display={{ base: isOpen ? 'block' : 'none', md: 'none' }} pb={4}>
          <VStack spacing={2} align="stretch">
            <VStack align="start" spacing={1}>
              <Text fontSize="sm" color={'white'}>
                Última atualização: {lastUpdate || 'Nunca'}
              </Text>
              {error && (
                <Alert status="error" size="sm" borderRadius="md">
                  <AlertIcon />
                  {error}
                </Alert>
              )}
            </VStack>
            
            <HStack spacing={2}>
              <Tooltip label="Testar Alerta Sonoro">
                <IconButton
                  aria-label="Testar Alerta"
                  icon={<ViewIcon />}
                  colorScheme="yellow"
                  onClick={tocarAlerta}
                  size="sm"
                />
              </Tooltip>
              
              <Button
                onClick={onRefresh}
                isLoading={loading}
                loadingText="Verificando..."
                colorScheme="green"
                leftIcon={<RepeatIcon />}
                size="sm"
                flex={1}
              >
                Verificar Agora
              </Button>
            </HStack>
            
            <HStack spacing={2}>
              <Button onClick={onConfigClick} size="sm" width="full" justifyContent="center">
                Configurar
              </Button>
              <Button onClick={onAddSiteClick} colorScheme="blue" size="sm" width="full" justifyContent="center">
                Adicionar Site
              </Button>
              <Button onClick={onAddTipoClick} colorScheme="purple" size="sm" width="full" justifyContent="center">
                Adicionar Tipo
              </Button>
            </HStack>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
} 