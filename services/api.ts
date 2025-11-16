// URL pública fornecida pelo túnel do Expo.
const BASE_URL = 'http://192.168.0.3:3000'; // <-- COLE A SUA URL DO TÚNEL AQUI

// Define um tipo para os dados do usuário que vamos enviar
interface RegisterUserData {
  nome: string;
  telefone: string;
  endereco: string;
  senha: string;
}

// Define um tipo para os dados de login
interface LoginUserData {
  telefone: string;
  senha: string;
}

export const registerUser = async (userData: RegisterUserData) => {
  try {
    const response = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      // Se a resposta não for 2xx, algo deu errado no backend
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao registrar usuário.');
    }

    // Se tudo deu certo, retorna os dados do usuário criado
    return await response.json();

  } catch (error) {
    console.error('Falha na chamada de API de registro:', error);
    // Re-lança o erro para que o componente da UI possa tratá-lo (ex: mostrar um alerta)
    throw error;
  }
};

export const loginUser = async (userData: LoginUserData) => {
  try {
    const response = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // O backend espera 'password', então renomeamos 'senha' aqui
      body: JSON.stringify({
        telefone: userData.telefone,
        password: userData.senha,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao fazer login.');
    }

    return await response.json();

  } catch (error) {
    console.error('Falha na chamada de API de login:', error);
    throw error;
  }
};
