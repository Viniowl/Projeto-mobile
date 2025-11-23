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
  await prisma.categoria.createMany({
    data: [
      { nome: 'Sabores' }, // Categoria para pastéis
      { nome: 'Bebidas' }, // Categoria para bebidas
    ],
    skipDuplicates: true,
  });

  console.log('Categorias criadas/verificadas.'); // Log de confirmação.

  // 2. Busca pelas categorias recém-criadas para obter seus IDs.
  // Os IDs são necessários para associar os produtos às suas respectivas categorias.
  const saboresCategory = await prisma.categoria.findUnique({ where: { nome: 'Sabores' } });
  const bebidasCategory = await prisma.categoria.findUnique({ where: { nome: 'Bebidas' } });

  // Verifica se as categorias foram encontradas antes de prosseguir.
  if (!saboresCategory || !bebidasCategory) {
    console.error('Não foi possível encontrar as categorias para o seeding.');
    return; // Encerra a execução se as categorias não existirem.
  }

  // 3. Define uma lista de produtos a serem criados.
  // Cada objeto representa um produto com nome, preço e o ID da sua categoria.
  const productsToCreate = [
    // Produtos da categoria "Sabores" (Pastéis)
    { nome: 'Carne', preco: 8.00, categoriaId: saboresCategory.id },
    { nome: 'Queijo', preco: 8.00, categoriaId: saboresCategory.id },
    { nome: 'Pizza', preco: 8.50, categoriaId: saboresCategory.id },
    { nome: 'Frango Catupiry', preco: 9.00, categoriaId: saboresCategory.id },
    { nome: 'Palmito', preco: 8.50, categoriaId: saboresCategory.id },
    { nome: 'Brigadeiro', preco: 9.50, categoriaId: saboresCategory.id },
    { nome: 'Doce de Leite', preco: 9.50, categoriaId: saboresCategory.id },

    // Produtos da categoria "Bebidas"
    { nome: 'Caldo. C 300ml', preco: 6.00, categoriaId: bebidasCategory.id },
    { nome: 'Caldo. C 500ml', preco: 8.00, categoriaId: bebidasCategory.id },
    { nome: 'Água Mineral', preco: 4.00, categoriaId: bebidasCategory.id },
    { nome: 'Refri. Lata', preco: 5.00, categoriaId: bebidasCategory.id },
  ];

  // 4. Insere os produtos no banco de dados.
  // `createMany` é usado para inserir todos os produtos de uma vez, de forma eficiente.
  // `skipDuplicates: true` garante que produtos com o mesmo nome não sejam duplicados.
  // Isso requer que o campo `name` no modelo `Product` seja definido como `@unique` no `schema.prisma`.
  await prisma.produto.createMany({
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