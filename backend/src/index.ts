
import { PrismaClient, Usuario } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import express, { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { AxiosError } from 'axios';
import cors from 'cors';

// Inicializa o aplicativo Express
const app = express();
// Habilita o middleware CORS para permitir requisições de diferentes origens
app.use(cors());
// Habilita o middleware para parsear requisições com corpo JSON
app.use(express.json());

// Inicializa o cliente Prisma para interagir com o banco de dados
const prisma = new PrismaClient();

// Obtém o segredo JWT das variáveis de ambiente. Essencial para assinar e verificar tokens.
const JWT_SECRET = process.env.JWT_SECRET;

// Verifica se a variável de ambiente JWT_SECRET está definida
if (!JWT_SECRET) {
  console.error('JWT_SECRET não está definido nas variáveis de ambiente.');
  // Encerra o processo se o segredo não estiver configurado, pois a aplicação não pode funcionar sem ele
  process.exit(1);
}

// Interface para estender o objeto Request do Express, adicionando uma propriedade 'user'
// Isso permite que o middleware de autenticação anexe o usuário autenticado à requisição
interface AuthRequest extends Request {
  user?: Usuario;
}

app.post('/register', async (req, res) => {
  // Extrai os dados do corpo da requisição
  const { nome, telefone, endereco, senha } = req.body;

  // Validação básica: verifica se todos os campos obrigatórios foram fornecidos
  if (!nome || !telefone || !endereco || !senha) {
    return res.status(400).json({ error: 'Por favor, preencha todos os campos.' });
  }

  try {
    // Gera um hash seguro da senha antes de armazená-la no banco de dados
    const hashedPassword = await bcrypt.hash(senha, 10);
    // Cria um novo usuário no banco de dados com a senha hasheada
    const user = await prisma.usuario.create({
      data: {
        nome,
        telefone,
        endereco,
        senha: hashedPassword, // Armazena a senha hasheada
      },
    });
    // Retorna o usuário criado com status 201 (Created)
    res.status(201).json(user);

  } catch (error) {
    // Em caso de erro (ex: telefone já cadastrado), retorna um erro 500
    res.status(500).json({ error: 'Erro ao criar usuário.' });
  }
});

app.post('/login', async (req, res) => {
  // Extrai telefone e senha do corpo da requisição
  const { telefone, senha } = req.body;

  // Validação básica: verifica se telefone e senha foram fornecidos
  if (!telefone || !senha) {
    return res.status(400).json({ error: 'Por favor, preencha todos os campos.' });
  }

  try {
    // Busca o usuário no banco de dados pelo telefone
    const user = await prisma.usuario.findUnique({
      where: { telefone },
    });

    // Se o usuário não for encontrado, retorna erro 404
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    // Compara a senha fornecida com a senha hasheada armazenada no banco de dados
    const passwordMatch = await bcrypt.compare(senha, user.senha);

    if (passwordMatch) {
      // Se as senhas coincidirem, gera um token JWT para o usuário
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1d' }); // Token expira em 1 dia

      // Retorna o token JWT e informações básicas do usuário (sem a senha)
      res.status(200).json({
        token,
        user: {
          id: user.id,
          nome: user.nome,
          telefone: user.telefone,
        },
      });
    } else {
      // Se as senhas não coincidirem, retorna erro 401 (Unauthorized)
      res.status(401).json({ error: 'Senha incorreta.' });
    }
  } catch (error) {
    console.error(error);
    // Em caso de erro no servidor, retorna erro 500
    res.status(500).json({ error: 'Erro ao fazer login.' });
  }
});

// Middleware de autenticação
// Middleware de autenticação: verifica a presença e validade de um token JWT
const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  // Obtém o cabeçalho de autorização da requisição
  const authHeader = req.headers['authorization'];
  // Extrai o token do formato "Bearer TOKEN"
  const token = authHeader && authHeader.split(' ')[1];

  // Se não houver token, retorna 401 (Unauthorized)
  if (token == null) {
    return res.sendStatus(401);
  }

  try {
    // Verifica e decodifica o token JWT usando o segredo
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    // Busca o usuário no banco de dados com base no userId do payload
    const user = await prisma.usuario.findUnique({ where: { id: payload.userId } });

    // Se o usuário não for encontrado, retorna 403 (Forbidden)
    if (!user) {
      return res.sendStatus(403);
    }

    // Anexa o objeto do usuário à requisição para uso posterior nas rotas
    req.user = user;
    // Continua para a próxima função middleware ou rota
    next();
  } catch (err) {
    // Se o token for inválido ou expirado, retorna 403 (Forbidden)
    return res.sendStatus(403);
  }
};


// --- ROTAS DO CARDÁPIO ---

// ROTA PARA LISTAR O CARDÁPIO COMPLETO (Categorias com seus produtos)
app.get('/menu', async (req, res) => {
  try {
    // Busca todas as categorias e inclui os produtos associados a cada categoria
    const menu = await prisma.categoria.findMany({
      include: {
        produtos: true, // Inclui a lista de produtos dentro de cada categoria
      },
    });
    // Retorna o cardápio completo com status 200 (OK)
    res.status(200).json(menu);
  } catch (error) {
    // Em caso de erro, retorna erro 500
    res.status(500).json({ error: 'Erro ao buscar o cardápio.' });
  }
});

// --- ROTAS DE PEDIDO ---

// ROTA PARA CRIAR UM NOVO PEDIDO (protegida)
// ROTA PARA CRIAR UM NOVO PEDIDO (protegida por autenticação)
app.post('/orders', authenticateToken, async (req: AuthRequest, res: Response) => {
  // Extrai os itens do pedido e o total do corpo da requisição
  const { items, total } = req.body;
  // Obtém o ID do usuário autenticado a partir da requisição (anexado pelo middleware)
  const userId = req.user?.id;

  // Verifica se o usuário está autenticado
  if (!userId) {
    return res.status(403).json({ error: 'Usuário não autenticado.' });
  }

  // Validação dos dados do pedido: verifica se 'items' é um array não vazio e se 'total' existe
  if (!items || !Array.isArray(items) || items.length === 0 || !total) {
    return res.status(400).json({ error: 'Dados do pedido inválidos. Certifique-se de que "items" é um array com produtos e "total" está presente.' });
  }
  
  // Extrai os IDs dos produtos dos itens do pedido
  const productIds = items.map((item: { id: string; quantidade: number; preco: number }) => item.id);

  // Realiza uma transação para buscar e validar o usuário e os produtos simultaneamente
  // Isso garante consistência e melhor performance
  const [user, existingProducts] = await prisma.$transaction([
      // A. Busca e valida o User
      prisma.usuario.findUnique({
          where: { id: userId },
      }),
      // B. Busca e valida os Products
      prisma.produto.findMany({
          where: { id: { in: productIds } },
      }),
  ]);

  // 3. VERIFICAÇÃO DE ERROS

  // Se o usuário não for encontrado, retorna erro 404
  if (!user) {
      console.error(`Erro: userId "${userId}" não encontrado.`);
      return res.status(404).json({ error: 'Usuário não encontrado. O pedido requer um userId válido.' });
  }

  // Verifica se todos os produtos referenciados no pedido existem no banco de dados
  if (existingProducts.length !== productIds.length) {
      // Identifica quais IDs de produtos estão faltando para fornecer um erro mais detalhado
      const existingIds = new Set(existingProducts.map(p => p.id));
      const missingIds = productIds.filter(id => !existingIds.has(id));

      console.error(`Erro: Um ou mais produtos não foram encontrados: ${missingIds.join(', ')}`);
      return res.status(404).json({
          error: 'Um ou mais itens do pedido fazem referência a produtos inexistentes.',
          missingProductIds: missingIds,
      });
  }

  try {
    // Cria um mapa de IDs de produtos para seus nomes para facilitar a atribuição
    const productMap = new Map(existingProducts.map(p => [p.id, p.nome]));
    // Cria o pedido e os itens do pedido em uma única operação transacional
    const order = await prisma.pedido.create({
      data: {
        total,
        usuarioId: userId,
        // Cria os itens do pedido associados a este pedido
        itens: {
          create: items.map((item: { id: string; quantidade: number; preco: number }) => ({
            produtoId: item.id,
            quantidade: item.quantidade,
            preco: item.preco,
            nomeProduto: productMap.get(item.id) || 'Produto Desconhecido', // Atribui o nome do produto
            nomeUsuario: user.nome, // Atribui o nome do usuário ao item do pedido
          })),
        },
      },
      include: {
        itens: true, // Inclui os itens do pedido no objeto de retorno
        usuario: {
          select: {
            nome: true, // Inclui apenas o nome do usuário no objeto de retorno
          }
        }
      },
    });

    // Retorna o pedido criado com status 201 (Created)
    res.status(201).json(order);
  } catch (error) {
    console.error("Erro ao criar pedido:", error);
    let details = 'Erro desconhecido';
      // Tenta extrair detalhes do erro se for uma instância de AxiosError ou Error
      if (error instanceof AxiosError) {
        details = error.response?.data || error.message;
      } else if (error instanceof Error) {
        details = error.message;
      }
      // Retorna erro 500 com detalhes
      res.status(500).json({ error: 'Não foi possível criar o pedido.', details });

    }
});


// Define a porta em que o servidor irá escutar. Usa a variável de ambiente PORT ou 3000 como padrão.
const PORT = process.env.PORT || 3000;
// Inicia o servidor e loga a porta em que está rodando
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
