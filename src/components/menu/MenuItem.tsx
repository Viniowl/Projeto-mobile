// Componente que exibe um item do menu (produto) com imagem, nome e preço.
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Product } from '../../context/MenuContext';

// Propriedades esperadas pelo MenuItem
interface MenuItemProps {
  item: Product;
  onPress: () => void;
  isSelected: boolean;
}

// Renderiza card de produto do menu
export function MenuItem({ item, onPress, isSelected }: MenuItemProps) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.itemContainer, isSelected && styles.itemSelected]}>
      {item.image && <Image source={item.image} style={styles.itemImage} />}
      <View style={styles.itemTextWrap}>
        <Text style={styles.itemTitle}>{item.nome}</Text>
        <Text style={styles.itemPrice}>{`R$ ${item.preco.toFixed(2)}`}</Text>
      </View>
    </TouchableOpacity>
  );
}

// Estilos para o card de item do menu
const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center', // Alinhar itens verticalmente
    padding: 12,
    width: '90%',
    alignSelf: 'center',
    backgroundColor: '#ffffff',
    marginVertical: 8,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  itemSelected: {
    backgroundColor: '#ffe9d6',
    borderColor: '#f73d04',
    borderWidth: 1,
  },
  itemImage: {
    width: 70, // Tamanho fixo para a imagem
    height: 70, // Tamanho fixo para a imagem
    borderRadius: 8, // Borda arredondada para a imagem
    marginRight: 12, // Espaçamento entre a imagem e o texto
  },
  itemTitle: {
    fontSize: 18,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    backgroundColor: '#f3d8b0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  itemTextWrap: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
