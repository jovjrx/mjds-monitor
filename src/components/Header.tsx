'use client';

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
  ButtonGroup,
  Spinner,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon, RepeatIcon, SunIcon, MoonIcon, BellIcon, SettingsIcon, AddIcon, WarningIcon } from '@chakra-ui/icons';
import { useColorMode } from '@chakra-ui/react';

interface HeaderProps {
  onConfigClick: () => void;
  onAddSiteClick: () => void;
  onAddTipoClick: () => void;
  onRefresh: () => void;
  onVerSitesOffline: () => void;
  loading: boolean;
  lastUpdate: string;
  error: string;
  progresso?: { atual: number; total: number; percentual: number } | null;
  verificando?: boolean;
  verificandoSite?: boolean;
  currentSite?: string;
}

export default function Header({
  onConfigClick,
  onAddSiteClick,
  onAddTipoClick,
  onRefresh,
  onVerSitesOffline,
  loading,
  lastUpdate,
  error,
  progresso,
  verificando,
  verificandoSite,
  currentSite
}: HeaderProps) {
  const { isOpen, onToggle } = useDisclosure();
  const { colorMode, toggleColorMode } = useColorMode();

  const bgColor = useColorModeValue('blue.600', 'blue.900');
  const borderColor = useColorModeValue('blue.500', 'blue.800');  
  const badgeBg = useColorModeValue('green.200', 'green.50');
  const badgeColor = useColorModeValue('green.700', 'green.700');

  const tocarAlerta = () => {
    const audio = new Audio('/alerta.mp3');
    audio.currentTime = 0;
    audio.play().catch((error) => {
      console.error('❌ Erro ao tocar alerta sonoro:', error);
    });
  };

  return (
    <Box
      bg={bgColor}
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
            <HStack spacing={1} bg={badgeBg} color={badgeColor} p={1} pl={2} borderRadius="md" boxShadow="sm">
              {error ? (
                <Text fontSize="xs" color="red.500">
                  Erro: {error}
                </Text>
              ) : verificando && progresso ? (
                <Text fontSize="sm" fontWeight="medium">
                  Verificando {progresso.atual}/{progresso.total}
                </Text>
              ) : verificandoSite ? (
                <HStack spacing={1}>
                  <Spinner size="xs" />
                  <Text fontSize="sm" fontWeight="medium">
                    Verificando site...
                  </Text>
                </HStack>
              ) : (
                <Text fontSize="sm" fontWeight="medium">
                  {lastUpdate || 'Aguardando...'}
                </Text>
              )}

              <Tooltip label="Verificar agora">
                <IconButton
                  aria-label="Verificar"
                  icon={(verificando && progresso) ? <Spinner size="xs" colorScheme='green' /> : <RepeatIcon />}
                  colorScheme="green"
                  variant="solid"
                  disabled={verificando}
                  onClick={onRefresh}
                  isLoading={loading}
                  size="xs"
                  ml={1}
                />
              </Tooltip>
            </HStack>

            <Tooltip label="Alternar tema escuro/claro">
              <IconButton
                aria-label="Alternar tema"
                icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                onClick={toggleColorMode}
                colorScheme="cyan"
                size="sm"
              />
            </Tooltip>
            <Tooltip label="Testar Alerta Sonoro">
              <IconButton
                aria-label="Testar Alerta"
                icon={<BellIcon />}
                colorScheme="yellow"
                onClick={tocarAlerta}
                size="sm"
              />
            </Tooltip>
            <Tooltip label="Ver Problemas">
              <IconButton
                aria-label="Ver Problemas"
                icon={<WarningIcon />}
                colorScheme="red"
                onClick={() => onVerSitesOffline()}
                size="sm"
              />
            </Tooltip>
            <Tooltip label="Configurações">
              <IconButton
                aria-label="Configurações"
                icon={<SettingsIcon />}
                colorScheme="purple"
                onClick={onConfigClick}
                size="sm"
              />
            </Tooltip>


            <ButtonGroup isAttached variant="outline" size="sm">
              <Tooltip label="Adicionar Site" placement='left'>
                <Button onClick={onAddSiteClick} colorScheme="cyan" size="sm" variant="solid" leftIcon={<AddIcon />}>
                  Site
                </Button>
              </Tooltip>
              <Tooltip label="Adicionar Tipo" placement='left' >
                <Button onClick={onAddTipoClick} colorScheme="teal" size="sm" variant="solid" leftIcon={<AddIcon />}>
                  Tipo
                </Button>
              </Tooltip>
            </ButtonGroup>

          </HStack>

          <IconButton
            display={{ base: 'flex', md: 'none' }}
            onClick={onToggle}
            size="sm"
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            variant="outline"
            colorScheme="white"
            aria-label="Abrir Menu"
          />
        </Flex>

        <Box display={{ base: isOpen ? 'block' : 'none', md: 'none' }} pb={4}>
          <VStack spacing={2} align="stretch">
            <HStack spacing={1} bg={badgeBg} color={badgeColor} p={1} pl={2} justifyContent="space-between" borderRadius="md" boxShadow="sm">
              {error ? (
                <Text fontSize="xs" color="red.500">
                  Erro: {error}
                </Text>
              ) : verificando && progresso ? (
                <Text fontSize="sm" fontWeight="medium">
                  Verificando {progresso.atual}/{progresso.total}
                </Text>
              ) : (
                <Text fontSize="sm" fontWeight="medium">
                  {lastUpdate || 'Aguardando...'}
                </Text>
              )}

              <Tooltip label="Verificar agora">
                <IconButton
                  aria-label="Verificar"
                  icon={<RepeatIcon />}
                  colorScheme="green"
                  variant="solid"
                  onClick={onRefresh}
                  isLoading={loading}
                  size="xs"
                  ml={1}
                />
              </Tooltip>
            </HStack>

            <HStack spacing={2} justifyContent="space-between">
              <HStack spacing={2}>


                <Tooltip label="Alternar tema escuro/claro">
                  <IconButton
                    aria-label="Alternar tema"
                    icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                    onClick={toggleColorMode}
                    colorScheme="cyan"
                    size="sm"
                  />
                </Tooltip>
                <Tooltip label="Testar Alerta Sonoro">
                  <IconButton
                    aria-label="Testar Alerta"
                    icon={<BellIcon />}
                    colorScheme="yellow"
                    onClick={tocarAlerta}
                    size="sm"
                  />
                </Tooltip>
                <Tooltip label="Ver Sites Offline">
                  <IconButton
                    aria-label="Ver Sites Offline"
                    icon={<WarningIcon />}
                    colorScheme="red"
                    onClick={onVerSitesOffline}
                    size="sm"
                  />
                </Tooltip>
                <Tooltip label="Configurações">
                  <IconButton
                    aria-label="Configurações"
                    icon={<SettingsIcon />}
                    colorScheme="purple"
                    onClick={onConfigClick}
                    size="sm"
                  />
                </Tooltip>
              </HStack>
              <ButtonGroup isAttached variant="outline" size="sm">
                <Tooltip label="Adicionar Site" placement='left'>
                  <Button onClick={onAddSiteClick} colorScheme="cyan" size="sm" variant="solid" leftIcon={<AddIcon />}>
                    Site
                  </Button>
                </Tooltip>
                <Tooltip label="Adicionar Tipo" placement='left' >
                  <Button onClick={onAddTipoClick} colorScheme="teal" size="sm" variant="solid" leftIcon={<AddIcon />}>
                    Tipo
                  </Button>
                </Tooltip>
              </ButtonGroup>
            </HStack>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
} 