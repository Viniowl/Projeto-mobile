// Componente para exibir notificações de sucesso ou erro animadas na tela.
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Propriedades esperadas pelo Notification
interface NotificationProps {
  visible: boolean;
  message: string;
  type: 'success' | 'error';
  anim: Animated.Value;
  actionLabel?: string;
  onAction?: () => void;
  title?: string;
}

// Renderiza notificação animada de sucesso ou erro
export function Notification({ visible, message, type, anim, actionLabel, onAction, title }: NotificationProps) {
  if (!visible) {
    return null;
  }

  const isSuccess = type === 'success';
  const icon = isSuccess ? 'check-circle' : 'error';
  const boxStyle = isSuccess ? styles.successBox : styles.errorBox;
  const displayedTitle = title || (isSuccess ? 'Sucesso' : 'Erro');

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <Animated.View
        style={[
          boxStyle,
          { transform: [{ scale: anim }], opacity: anim, marginTop: 6 },
        ]}
      >
        <MaterialIcons name={icon} size={isSuccess ? 64 : 56} color="#fff" />
        <Text style={styles.title}>{displayedTitle}</Text>
        <Text style={styles.message}>{message}</Text>
        {typeof onAction === 'function' && actionLabel && (
          <TouchableOpacity style={styles.actionButton} onPress={onAction} accessibilityLabel={actionLabel}>
            <Text style={styles.actionLabel}>{actionLabel}</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
}

// Estilos para a notificação animada
const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  successBox: {
    backgroundColor: '#2ecc71',
    padding: 22,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 260,
  },
  errorBox: {
    backgroundColor: '#e74c3c',
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 260,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 8,
  },
  message: {
    color: '#f6fff9',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
    opacity: 0.95,
  },
  actionButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 10,
    borderRadius: 8,
  },
  actionLabel: {
    color: '#2d160e',
    fontWeight: '700',
  },
});
