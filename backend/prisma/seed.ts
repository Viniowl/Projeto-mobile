import { PrismaClient } from '@prisma/client';

// Inicializa o Prisma Client
const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando o seeding do cardápio...');

  // 1. Criar as categorias (se ainda não existirem)
  await prisma.category.createMany({
    data: [
      { name: 'Sabores' },
      { name: 'Bebidas' },
    ],
    skipDuplicates: true, // Não vai dar erro se as categorias já existirem
  });

  console.log('Categorias criadas/verificadas.');

  // 2. Buscar as categorias para pegar seus IDs
  const saboresCategory = await prisma.category.findUnique({ where: { name: 'Sabores' } });
  const bebidasCategory = await prisma.category.findUnique({ where: { name: 'Bebidas' } });

  if (!saboresCategory || !bebidasCategory) {
    console.error('Não foi possível encontrar as categorias para o seeding.');
    return;
  }

  // 3. Definir os produtos
  const productsToCreate = [
    // Sabores
    { name: 'Carne', price: 8.00, categoryId: saboresCategory.id },
    { name: 'Queijo', price: 8.00, categoryId: saboresCategory.id },
    { name: 'Pizza', price: 8.50, categoryId: saboresCategory.id },
    { name: 'Frango Catupiry', price: 9.00, categoryId: saboresCategory.id },
    { name: 'Palmito', price: 8.50, categoryId: saboresCategory.id },
    { name: 'Brigadeiro', price: 9.50, categoryId: saboresCategory.id },
    { name: 'Doce de Leite', price: 9.50, categoryId: saboresCategory.id },

    // Bebidas
    { name: 'Caldo. C 300ml', price: 6.00, categoryId: bebidasCategory.id },
    { name: 'Caldo. C 500ml', price: 8.00, categoryId: bebidasCategory.id },
    { name: 'Água Mineral', price: 4.00, categoryId: bebidasCategory.id },
    { name: 'Refri. Lata', price: 5.00, categoryId: bebidasCategory.id },
  ];

  // 4. Criar os produtos (usando createMany para eficiência)
  // O `skipDuplicates` aqui vai pular produtos com o mesmo `name`
  // NOTA: Para isso funcionar, o campo `name` no modelo `Product` precisa ser `@unique`
  // Vou assumir que podemos fazer essa alteração no schema.prisma
  await prisma.product.createMany({
    data: productsToCreate,
    skipDuplicates: true,
  });

  console.log('Produtos criados/verificados.');
  console.log('Seeding do cardápio concluído.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // Fecha a conexão com o banco de dados
    await prisma.$disconnect();
  });