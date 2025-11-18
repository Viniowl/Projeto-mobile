
import { PrismaClient, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import express, { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { AxiosError } from 'axios';
import cors from 'cors';

const app = express();
app.use(cors()); // Adiciona o middleware do CORS
app.use(express.json());

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('JWT_SECRET não está definido nas variáveis de ambiente.');
  process.exit(1);
}

// Interface para estender o Request do Express e adicionar a propriedade user
interface AuthRequest extends Request {
  user?: User;
}

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
      // Gera o token JWT
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1d' }); // Token expira em 1 dia

      // Retorna o token e os dados do usuário (sem a senha)
      res.status(200).json({
        token,
        user: {
          id: user.id,
          name: user.name,
          telefone: user.telefone,
        },
      });
    } else {
      res.status(401).json({ error: 'Senha incorreta.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao fazer login.' });
  }
});

// Middleware de autenticação
const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Formato: "Bearer TOKEN"

  if (token == null) {
    return res.sendStatus(401); // Unauthorized
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });

    if (!user) {
      return res.sendStatus(403); // Forbidden
    }

    req.user = user; // Anexa o usuário à requisição
    next();
  } catch (err) {
    return res.sendStatus(403); // Forbidden
  }
};


// --- ROTAS DO CARDÁPIO ---

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

// --- ROTAS DE PEDIDO ---

// ROTA PARA CRIAR UM NOVO PEDIDO (protegida)
app.post('/orders', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { items, total } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(403).json({ error: 'Usuário não autenticado.' });
  }

  if (!items || !Array.isArray(items) || items.length === 0 || !total) {
    return res.status(400).json({ error: 'Dados do pedido inválidos.' });
  }
  
  const productIds = items.map((item: { id: string; quantity: number; price: number }) => item.id);

  // 2. VALIDAR O USUÁRIO E OS PRODUTOS EM TRANSAÇÃO (melhor performance)
  const [user, existingProducts] = await prisma.$transaction([
      // A. Busca e valida o User
      prisma.user.findUnique({
          where: { id: userId },
      }),
      // B. Busca e valida os Products
      prisma.product.findMany({
          where: { id: { in: productIds } },
      }),
  ]);

  // 3. VERIFICAÇÃO DE ERROS

  if (!user) {
      // Retorna 404 se o usuário não existir
      console.error(`Erro: userId "${userId}" não encontrado.`);
      return res.status(404).json({ error: 'Usuário não encontrado. O pedido requer um userId válido.' });
  }

  // Verifica se a contagem de produtos existentes é igual à contagem de IDs fornecidos
  if (existingProducts.length !== productIds.length) {
      // Calcula quais IDs estão faltando para detalhar o erro
      const existingIds = new Set(existingProducts.map(p => p.id));
      const missingIds = productIds.filter(id => !existingIds.has(id));

      console.error(`Erro: Um ou mais produtos não foram encontrados: ${missingIds.join(', ')}`);
      return res.status(404).json({
          error: 'Um ou mais itens do pedido fazem referência a produtos inexistentes.',
          missingProductIds: missingIds,
      });
  }

  try {
    const productMap = new Map(existingProducts.map(p => [p.id, p.name]));
    // Cria o pedido e os itens do pedido em uma única transação
    const order = await prisma.order.create({
      data: {
        total,
        userId,
        items: {
          create: items.map((item: { id: string; quantity: number; price: number }) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
            productName: productMap.get(item.id) || 'Produto Desconhecido',
            userName: user.name,
          })),
        },
      },
      include: {
        items: true, // Inclui os itens no retorno
        user: {
          select: {
            name: true,
          }
        }
      },
    });

    res.status(201).json(order);
  } catch (error) {
    console.error("Erro ao criar pedido:", error);
    let details = 'Erro desconhecido';
      if (error instanceof AxiosError) {
        details = error.response?.data || error.message;
      } else if (error instanceof Error) {
        details = error.message;
      }
      res.status(500).json({ error: 'Não foi possível criar o pedido.', details });

    }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
