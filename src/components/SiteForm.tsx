'use client';

import { useState, useEffect } from 'react';
import {
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  Alert,
  AlertIcon,
  useColorModeValue,
  Text,
} from '@chakra-ui/react';
import { Tipo } from '@/utils/verificarSite';

interface SiteFormProps {
  onClose: () => void;
  editingSiteId?: string;
}

export default function SiteForm({ onClose, editingSiteId }: SiteFormProps) {
  const [nome, setNome] = useState('');
  const [url, setUrl] = useState('');
  const [tipoId, setTipoId] = useState('');
  const [tipos, setTipos] = useState<Tipo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    carregarTipos();
    if (editingSiteId) {
      setIsEditing(true);
      carregarSiteParaEdicao(editingSiteId);
    }
  }, [editingSiteId]);

  const carregarTipos = async () => {
    try {
      const response = await fetch('/api/tipos');
      const data = await response.json();
      
      if (data.success) {
        setTipos(data.data);
        if (data.data.length > 0 && !tipoId) {
          setTipoId(data.data[0].id);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar tipos:', error);
    }
  };

  const carregarSiteParaEdicao = async (siteId: string) => {
    try {
      const response = await fetch('/api/sites');
      const data = await response.json();
      
      if (data.success) {
        const site = data.data.find((s: any) => s.id === siteId);
        if (site) {
          setNome(site.nome);
          setUrl(site.url);
          setTipoId(site.tipoId);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar site:', error);
      setError('Erro ao carregar dados do site');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!nome.trim() || !url.trim() || !tipoId) {
      setError('Todos os campos são obrigatórios');
      setLoading(false);
      return;
    }

    try {
      const method = isEditing ? 'PUT' : 'POST';
      const endpoint = '/api/sites';
      
      const requestBody = {
        nome: nome.trim(),
        url: url.trim(),
        tipoId,
        ativo: true,
      };

      // Adicionar ID ao body se estiver editando
      if (isEditing && editingSiteId) {
        (requestBody as any).id = editingSiteId;
      }
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.success) {
        onClose();
      } else {
        setError(data.error || 'Erro ao salvar site');
      }
    } catch (error) {
      console.error('Erro ao salvar site:', error);
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={4} align="stretch">
        <Text fontSize="lg" fontWeight="medium" color={useColorModeValue('gray.700', 'gray.300')}>
          {isEditing ? 'Editar Site' : 'Adicionar Novo Site'}
        </Text>

        {error && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            {error}
          </Alert>
        )}

        <FormControl isRequired>
          <FormLabel fontSize="sm" color={useColorModeValue('gray.700', 'gray.300')}>
            Nome do Site
          </FormLabel>
          <Input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Site Principal"
            bg={useColorModeValue('white', 'gray.800')}
            borderColor={useColorModeValue('gray.200', 'gray.700')}
            _focus={{
              borderColor: 'blue.500',
              boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
            }}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel fontSize="sm" color={useColorModeValue('gray.700', 'gray.300')}>
            URL
          </FormLabel>
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://exemplo.com"
            bg={useColorModeValue('white', 'gray.800')}
            borderColor={useColorModeValue('gray.200', 'gray.700')}
            _focus={{
              borderColor: 'blue.500',
              boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
            }}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel fontSize="sm" color={useColorModeValue('gray.700', 'gray.300')}>
            Tipo
          </FormLabel>
          <Select
            value={tipoId}
            onChange={(e) => setTipoId(e.target.value)}
            bg={useColorModeValue('white', 'gray.800')}
            borderColor={useColorModeValue('gray.200', 'gray.700')}
            _focus={{
              borderColor: 'blue.500',
              boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
            }}
          >
            {tipos.map((tipo) => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nome}
              </option>
            ))}
          </Select>
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
            loadingText={isEditing ? "Salvando..." : "Adicionando..."}
          >
            {isEditing ? 'Salvar Alterações' : 'Adicionar Site'}
          </Button>
        </HStack>
      </VStack>
    </form>
  );
}
