// Hook personalizado para detectar altura e visibilidade do teclado virtual no React Native.
import { useEffect, useState } from 'react';
import { Keyboard } from 'react-native';

/**
 * Retorna altura do teclado e se está visível.
 * Útil para ajustar layouts quando o teclado aparece.
 */
export function useKeyboard() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    // Adiciona listeners para detectar quando o teclado aparece ou desaparece
    const showSubscription = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      setIsKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
      setIsKeyboardVisible(false);
    });

    // Remove listeners ao desmontar o componente
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // Retorna altura e visibilidade do teclado
  return { keyboardHeight, isKeyboardVisible };
}
