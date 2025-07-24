'use client';

import {
  Modal as ChakraModal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useColorModeValue,
} from '@chakra-ui/react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <ChakraModal isOpen={isOpen} onClose={onClose} isCentered size="lg">
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
      <ModalContent
        bg={bgColor}
        border="1px"
        borderColor={borderColor}
        borderRadius="xl"
        boxShadow="xl"
        mx={4}
      >
        <ModalHeader
          borderBottom="1px"
          borderColor={borderColor}
          pb={4}
          fontSize="lg"
          fontWeight="semibold"
        >
          {title}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody py={6}>
          {children}
        </ModalBody>
      </ModalContent>
    </ChakraModal>
  );
}
