// Componente modal para adicionar itens ao pedido a partir do menu.
import React from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { MenuCategory, Product } from '../../context/MenuContext';

// Propriedades esperadas pelo AddItemModal
interface AddItemModalProps {
  visible: boolean;
  onClose: () => void;
  onAddItem: (item: Product) => void;
  menu: MenuCategory[];
}

// Renderiza modal para seleção e adição de itens ao pedido
export function AddItemModal({ visible, onClose, onAddItem, menu }: AddItemModalProps) {
  const { width, height } = useWindowDimensions();
  const isSmall = width < 360 || height < 700;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, isSmall && styles.modalContainerSmall]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Adicionar ao pedido</Text>
            <Pressable onPress={onClose} style={styles.modalClose} accessibilityLabel="Fechar">
              <Text style={styles.modalCloseText}>Fechar</Text>
            </Pressable>
          </View>
          <FlatList
            data={menu.flatMap(category => category.produtos)}
            keyExtractor={(it) => it.id}
            renderItem={({ item }) => (
              <View style={styles.modalItem}>
                <View>
                  <Text style={styles.modalItemTitle}>{item.nome}</Text>
                  <Text style={styles.modalItemPrice}>R$ {item.preco.toFixed(2).replace('.', ',')}</Text>
                </View>
                <TouchableOpacity
                  style={styles.modalAddButton}
                  onPress={() => onAddItem(item)}
                >
                  <Text style={styles.modalAddText}>Adicionar</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}

// Estilos para o modal de adicionar item
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    maxHeight: '70%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    padding: 14,
  },
  modalContainerSmall: {
    padding: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalClose: {
    padding: 6,
  },
  modalCloseText: {
    color: '#d94a00',
    fontWeight: '700',
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalItemTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalItemPrice: {
    fontSize: 14,
    color: '#666',
  },
  modalAddButton: {
    backgroundColor: '#d94a00',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  modalAddText: {
    color: '#fff',
    fontWeight: '700',
  },
});
