export interface MenuItemData {
  id: string;
  title: string;
  price: string;
  category: 'sabores' | 'bebidas';
  image?: any;
}

export const menuData: MenuItemData[] = [
  { id: '1', title: 'Carne', price: 'R$ 8,00', category: 'sabores', image: require('../../assets/images/pasteldecarne.png') },
  { id: '2', title: 'Queijo', price: 'R$ 8,00', category: 'sabores', image: require('../../assets/images/pastel-de-feira-de-queijo.jpg') },
  { id: '3', title: 'Pizza', price: 'R$ 8,50', category: 'sabores', image: require('../../assets/images/pastel-pizza.png') },
  { id: '4', title: 'Frango Catupiry', price: 'R$ 9,00', category: 'sabores', image: require('../../assets/images/pasteldefrangocomcatupiry.jpg') },
  { id: '5', title: 'Palmito', price: 'R$ 8,50', category: 'sabores', image: require('../../assets/images/Pastel-dePalmitoCremoso.jpg') },
  { id: '6', title: 'Brigadeiro', price: 'R$ 9,50', category: 'sabores', image: require('../../assets/images/pastelbrigadeiro.png') },
  { id: '7', title: 'Doce de Leite', price: 'R$ 9,50', category: 'sabores', image: require('../../assets/images/pasteldocedeleite.png') },
  { id: '8', title: 'Caldo. C 300ml', price: 'R$ 6,00', category: 'bebidas', image: require('../../assets/images/CaldodeCana300ml.png') },
  { id: '9', title: 'Caldo. C 500ml', price: 'R$ 8,00', category: 'bebidas', image: require('../../assets/images/caldodecarna500ml.jpg') },
  { id: '10', title: 'Água Mineral', price: 'R$ 4,00', category: 'bebidas', image: require('../../assets/images/aguamineral.jpg') },
  { id: '11', title: 'Refri. Lata', price: 'R$ 5,00', category: 'bebidas', image: require('../../assets/images/refrigerantecoca.png') },
];
