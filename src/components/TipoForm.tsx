'use client';

import { useState } from 'react';
import {
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  Alert,
  AlertIcon,
  useColorModeValue,
  Text,
} from '@chakra-ui/react';

interface TipoFormProps {
  onClose: () => void;
}

export default function TipoForm({ onClose }: TipoFormProps) {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!nome.trim()) {
      setError('Nome é obrigatório');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/tipos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: nome.trim(),
          descricao: descricao.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        onClose();
      } else {
        setError(data.error || 'Erro ao adicionar tipo');
      }
    } catch (error) {
      console.error('Erro ao adicionar tipo:', error);
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={4} align="stretch">
        <Text fontSize="lg" fontWeight="medium" color={useColorModeValue('gray.700', 'gray.300')}>
          Adicionar Novo Tipo
        </Text>

        {error && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            {error}
          </Alert>
        )}

        <FormControl isRequired>
          <FormLabel fontSize="sm" color={useColorModeValue('gray.700', 'gray.300')}>
            Nome do Tipo
          </FormLabel>
          <Input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Institucional"
            bg={useColorModeValue('white', 'gray.800')}
            borderColor={useColorModeValue('gray.200', 'gray.700')}
            _focus={{
              borderColor: 'blue.500',
              boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
            }}
          />
        </FormControl>

        <FormControl>
          <FormLabel fontSize="sm" color={useColorModeValue('gray.700', 'gray.300')}>
            Descrição
          </FormLabel>
          <Textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Descrição opcional do tipo de site"
            bg={useColorModeValue('white', 'gray.800')}
            borderColor={useColorModeValue('gray.200', 'gray.700')}
            _focus={{
              borderColor: 'blue.500',
              boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
            }}
            rows={3}
          />
        </FormControl>

        <HStack justify="flex-end" pt={4}>
          <Button
            type="button"
            onClick={onClose}
            colorScheme="gray"
            size="md"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            colorScheme="blue"
            size="md"
            isLoading={loading}
            loadingText="Adicionando..."
          >
            Adicionar Tipo
          </Button>
        </HStack>
      </VStack>
    </form>
  );
}
