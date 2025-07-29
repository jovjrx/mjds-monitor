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
  Box,
  Button,
  useColorModeValue,
  Switch,
  FormControl,
  FormLabel,
  Tooltip,
} from '@chakra-ui/react';

interface ConfiguracaoProps {
  intervalSeconds: number;
  onIntervalChange: (seconds: number) => void;
  slowTimeout: number;
  offlineTimeout: number;
  onSlowTimeoutChange: (ms: number) => void;
  onOfflineTimeoutChange: (ms: number) => void;
  onClose: () => void;
}

export default function Configuracao({ intervalSeconds, onIntervalChange, slowTimeout, offlineTimeout, onSlowTimeoutChange, onOfflineTimeoutChange, onClose }: ConfiguracaoProps) {
  const [alertaSonoro, setAlertaSonoro] = useState(true);
  const [notificacoes, setNotificacoes] = useState(false);

  const [sliderHover, setSliderHover] = useState<{ [key: string]: boolean }>({});

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
      {[
        {
          label: 'Intervalo de Verificação',
          value: intervalSeconds,
          min: 60,
          max: 300,
          step: 10,
          colorScheme: 'blue',
          onChange: onIntervalChange,
          tooltip: formatarTempo(intervalSeconds),
        },
        {
          label: 'Tempo para considerar Lento (ms)',
          value: slowTimeout,
          min: 2000,
          max: 30000,
          step: 500,
          colorScheme: 'yellow',
          onChange: onSlowTimeoutChange,
          tooltip: `${(slowTimeout / 1000).toFixed(1)}s`,
        },
        {
          label: 'Tempo para considerar Offline (ms)',
          value: offlineTimeout,
          min: 5000,
          max: 60000,
          step: 1000,
          colorScheme: 'red',
          onChange: onOfflineTimeoutChange,
          tooltip: `${(offlineTimeout / 1000).toFixed(1)}s`,
        },
      ].map(({ label, value, min, max, step, colorScheme, onChange, tooltip }, i) => (
        <Box key={i}>
          <FormControl>
            <FormLabel fontSize="sm" color={useColorModeValue('gray.700', 'gray.300')}>
              {label}
            </FormLabel>
            <Slider
              value={value}
              min={min}
              max={max}
              step={step}
              onChange={onChange}
              colorScheme={colorScheme}
              onMouseEnter={() => setSliderHover((prev) => ({ ...prev, [label]: true }))}
              onMouseLeave={() => setSliderHover((prev) => ({ ...prev, [label]: false }))}
            >
              <SliderTrack bg={useColorModeValue('gray.200', 'gray.700')}>
                <SliderFilledTrack />
              </SliderTrack>
              <Tooltip
                hasArrow
                placement="top"
                isOpen={sliderHover[label]}
                label={tooltip}
              >
                <SliderThumb boxSize={5} />
              </Tooltip>
            </Slider>
            <Text fontSize="sm" color={useColorModeValue('gray.500', 'gray.400')}>
              Valor atual: <Text as="span" fontWeight="bold">{tooltip}</Text>
            </Text>
          </FormControl>
        </Box>
      ))}

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
