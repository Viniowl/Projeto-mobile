// Importa o Prisma Client para interagir com o banco de dados.
import { PrismaClient } from '@prisma/client';

// Inicializa uma nova instância do Prisma Client.
const prisma = new PrismaClient();

// Função principal assíncrona que executará o processo de "seeding" (popular o banco).
async function main() {
  console.log('Iniciando o seeding do cardápio...'); // Log para indicar o início do processo.

  // 1. Criação das categorias de produtos.
  // Utiliza `createMany` para criar múltiplos registros de uma só vez.
  // `skipDuplicates: true` evita erros se as categorias já existirem no banco.
  await prisma.category.createMany({
    data: [
      { name: 'Sabores' }, // Categoria para pastéis
      { name: 'Bebidas' }, // Categoria para bebidas
    ],
    skipDuplicates: true,
  });

  console.log('Categorias criadas/verificadas.'); // Log de confirmação.

  // 2. Busca pelas categorias recém-criadas para obter seus IDs.
  // Os IDs são necessários para associar os produtos às suas respectivas categorias.
  const saboresCategory = await prisma.category.findUnique({ where: { name: 'Sabores' } });
  const bebidasCategory = await prisma.category.findUnique({ where: { name: 'Bebidas' } });

  // Verifica se as categorias foram encontradas antes de prosseguir.
  if (!saboresCategory || !bebidasCategory) {
    console.error('Não foi possível encontrar as categorias para o seeding.');
    return; // Encerra a execução se as categorias não existirem.
  }

  // 3. Define uma lista de produtos a serem criados.
  // Cada objeto representa um produto com nome, preço e o ID da sua categoria.
  const productsToCreate = [
    // Produtos da categoria "Sabores" (Pastéis)
    { name: 'Carne', price: 8.00, categoryId: saboresCategory.id },
    { name: 'Queijo', price: 8.00, categoryId: saboresCategory.id },
    { name: 'Pizza', price: 8.50, categoryId: saboresCategory.id },
    { name: 'Frango Catupiry', price: 9.00, categoryId: saboresCategory.id },
    { name: 'Palmito', price: 8.50, categoryId: saboresCategory.id },
    { name: 'Brigadeiro', price: 9.50, categoryId: saboresCategory.id },
    { name: 'Doce de Leite', price: 9.50, categoryId: saboresCategory.id },

    // Produtos da categoria "Bebidas"
    { name: 'Caldo. C 300ml', price: 6.00, categoryId: bebidasCategory.id },
    { name: 'Caldo. C 500ml', price: 8.00, categoryId: bebidasCategory.id },
    { name: 'Água Mineral', price: 4.00, categoryId: bebidasCategory.id },
    { name: 'Refri. Lata', price: 5.00, categoryId: bebidasCategory.id },
  ];

  // 4. Insere os produtos no banco de dados.
  // `createMany` é usado para inserir todos os produtos de uma vez, de forma eficiente.
  // `skipDuplicates: true` garante que produtos com o mesmo nome não sejam duplicados.
  // Isso requer que o campo `name` no modelo `Product` seja definido como `@unique` no `schema.prisma`.
  await prisma.product.createMany({
    data: productsToCreate,
    skipDuplicates: true,
  });

  console.log('Produtos criados/verificados.'); // Log de confirmação.
  console.log('Seeding do cardápio concluído.'); // Log final do processo.
}

// Executa a função `main`.
main()
  .catch((e) => {
    // Em caso de erro durante o processo, exibe o erro no console.
    console.error(e);
    process.exit(1); // Encerra o processo com um código de erro.
  })
  .finally(async () => {
    // Garante que a conexão com o banco de dados seja sempre fechada ao final.
    await prisma.$disconnect();
  });