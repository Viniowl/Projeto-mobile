
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import express from 'express'; 

const app = express();
app.use(express.json());

const prisma = new PrismaClient();

app.post('/register', async (req, res) => {
  const { nome, telefone, endereco, senha } = req.body;

  if (!nome || !telefone || !endereco || !senha) {
    return res.status(400).json({ error: 'Por favor, preencha todos os campos.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(senha, 10);
    const user = await prisma.user.create({
      data: {
        name: nome,
        telefone,
        endereco,
        password: hashedPassword,
      },
    });
    res.status(201).json(user);

    // --- INÍCIO DA LÓGICA DE SEEDING ---
    // Esta lógica irá popular o banco com os dados do menu.
    console.log('Iniciando o seeding do cardápio...');

    // 1. Criar as categorias (se ainda não existirem)
    await prisma.category.createMany({
      data: [
        { name: 'Sabores' },
        { name: 'Bebidas' },
      ],
      skipDuplicates: true, // Não vai dar erro se as categorias já existirem
    });

    // 2. Buscar as categorias que acabamos de criar para pegar seus IDs
    const saboresCategory = await prisma.category.findUnique({ where: { name: 'Sabores' } });
    const bebidasCategory = await prisma.category.findUnique({ where: { name: 'Bebidas' } });

    if (!saboresCategory || !bebidasCategory) {
      console.error('Não foi possível encontrar as categorias para o seeding.');
      return;
    }

    // 3. Definir os produtos (baseado no seu menuData.ts)
    const productsToCreate = [
      { name: 'Carne', price: 8.00, categoryId: saboresCategory.id },
      { name: 'Queijo', price: 8.00, categoryId: saboresCategory.id },
      { name: 'Pizza', price: 8.50, categoryId: saboresCategory.id },
      { name: 'Frango Catupiry', price: 9.00, categoryId: saboresCategory.id },
      { name: 'Palmito', price: 8.50, categoryId: saboresCategory.id },
      { name: 'Brigadeiro', price: 9.50, categoryId: saboresCategory.id },
      { name: 'Doce de Leite', price: 9.50, categoryId: saboresCategory.id },
      { name: 'Caldo. C 300ml', price: 6.00, categoryId: bebidasCategory.id },
      { name: 'Caldo. C 500ml', price: 8.00, categoryId: bebidasCategory.id },
      { name: 'Água Mineral', price: 4.00, categoryId: bebidasCategory.id },
      { name: 'Refri. Lata', price: 5.00, categoryId: bebidasCategory.id },
    ];

    // 4. Criar os produtos (se ainda não existirem)
    // O Prisma não tem um "skipDuplicates" para createMany com todas as bases de dados,
    // então vamos criar um por um e ignorar erros de duplicidade.
    for (const productData of productsToCreate) {
      try {
        await prisma.product.create({
          data: productData,
        });
      } catch (e) {
        // Ignora o erro se o produto já existir (erro de constraint 'unique')
        // Você pode adicionar uma verificação mais específica do erro se desejar.
      }
    }

    console.log('Seeding do cardápio concluído.');
    // --- FIM DA LÓGICA DE SEEDING ---

  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar usuário.' });
  }
});

app.post('/login', async (req, res) => {
  const { telefone, password } = req.body;

  if (!telefone || !password) {
    return res.status(400).json({ error: 'Por favor, preencha todos os campos.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { telefone },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      res.status(200).json({ message: 'Login bem-sucedido.' });
    } else {
      res.status(401).json({ error: 'Senha incorreta.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao fazer login.' });
  }
});

// --- ROTAS DO CARDÁPIO ---

// ROTA PARA CRIAR UMA NOVA CATEGORIA (ex: "Sabores", "Bebidas")
app.post('/categories', async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'O nome da categoria é obrigatório.' });
  }
  try {
    const category = await prisma.category.create({
      data: { name },
    });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar categoria. O nome já pode existir.' });
  }
});

// ROTA PARA CRIAR UM NOVO PRODUTO
app.post('/products', async (req, res) => {
  const { name, price, categoryId } = req.body;
  if (!name || !price || !categoryId) {
    return res.status(400).json({ error: 'Os campos name, price e categoryId são obrigatórios.' });
  }
  try {
    const product = await prisma.product.create({
      data: {
        name,
        price: parseFloat(price), // Converte o preço para número
        categoryId,
      },
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar produto. Verifique se o categoryId é válido.' });
  }
});

// ROTA PARA LISTAR O CARDÁPIO COMPLETO (Categorias com seus produtos)
app.get('/menu', async (req, res) => {
  try {
    const menu = await prisma.category.findMany({
      include: {
        products: true, // Inclui a lista de produtos dentro de cada categoria
      },
    });
    res.status(200).json(menu);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar o cardápio.' });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
