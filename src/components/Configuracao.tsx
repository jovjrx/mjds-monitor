'use client';

import { useState } from 'react';
import {
  VStack,
  HStack,
  Text,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  Box,
  Button,
  useColorModeValue,
  Heading,
  Alert,
  AlertIcon,
  List,
  ListItem,
  ListIcon,
  Switch,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import { InfoIcon } from '@chakra-ui/icons';

interface ConfiguracaoProps {
  intervalSeconds: number;
  onIntervalChange: (seconds: number) => void;
  onClose: () => void;
}

export default function Configuracao({ intervalSeconds, onIntervalChange, onClose }: ConfiguracaoProps) {
  const [alertaSonoro, setAlertaSonoro] = useState(true);
  const [notificacoes, setNotificacoes] = useState(false);

  const formatarTempo = (segundos: number) => {
    if (segundos < 60) return `${segundos}s`;
    if (segundos < 3600) return `${Math.floor(segundos / 60)}m`;
    return `${Math.floor(segundos / 3600)}h`;
  };

  const handleSliderChange = (value: number) => {
    onIntervalChange(value);
  };

  return (
    <VStack spacing={8} align="stretch">
      <Box>
        <Text fontSize="md" fontWeight="medium" color={useColorModeValue('gray.700', 'gray.300')} mb={4}>
          Intervalo de Verificação
        </Text>
        
        <Box pb={2}>
          <Slider
            value={intervalSeconds}
            onChange={handleSliderChange}
            min={10}
            max={180}
            step={10}
            colorScheme="blue"
          >
            <SliderMark value={10} mt={2} fontSize="sm">
              30s
            </SliderMark>
            <SliderMark value={60} mt={2} fontSize="sm">
              1m
            </SliderMark>
            <SliderMark value={120} mt={2} fontSize="sm">
              2m
            </SliderMark>
            <SliderMark value={180} mt={2} fontSize="sm">
              3m
            </SliderMark>
            
            <SliderTrack bg={useColorModeValue('gray.200', 'gray.700')}>
              <SliderFilledTrack bg="blue.500" />
            </SliderTrack>
            <SliderThumb boxSize={6} />
          </Slider>
        </Box>
        
        <Text fontSize="sm" color={useColorModeValue('gray.500', 'gray.400')} mt={2}>
          Intervalo atual: <strong>{formatarTempo(intervalSeconds)}</strong>
        </Text>
      </Box>

      {/* Alertas */}
      <Box>
        <Text fontSize="md" fontWeight="medium" color={useColorModeValue('gray.700', 'gray.300')} mb={4}>
          Alertas e Notificações
        </Text>
        
        <VStack spacing={4} align="stretch">
          <FormControl display="flex" alignItems="center">
            <FormLabel htmlFor="alerta-sonoro" mb="0" fontSize="sm">
              Alerta sonoro quando site ficar offline
            </FormLabel>
            <Switch
              id="alerta-sonoro"
              isChecked={alertaSonoro}
              onChange={(e) => setAlertaSonoro(e.target.checked)}
              colorScheme="blue"
            />
          </FormControl>
          
          <FormControl display="flex" alignItems="center">
            <FormLabel htmlFor="notificacoes" mb="0" fontSize="sm">
              Notificações do navegador
            </FormLabel>
            <Switch
              id="notificacoes"
              isChecked={notificacoes}
              onChange={(e) => setNotificacoes(e.target.checked)}
              colorScheme="blue"
            />
          </FormControl>
        </VStack>
      </Box>

      <HStack justify="flex-end" pt={4}>
        <Button
          onClick={onClose}
          colorScheme="gray"
          size="md"
        >
          Fechar
        </Button>
      </HStack>
    </VStack>
  );
}
