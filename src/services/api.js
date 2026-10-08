import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 10.0.2.2 é o endereço do localhost do PC dentro do Emulador Android
export const BASE_URL = 'http://10.0.2.2:3000';

// Instância do Axios com configurações base
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Interceptor: Adiciona o token Bearer automaticamente antes de cada requisição
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('@sabor_digital_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Função helper adaptada para manter compatibilidade com todos os ecrãs já criados
 */
export async function apiFetch(endpoint, options = {}) {
  const { method = 'GET', body, headers = {} } = options;

  // Se o body for FormData (upload de imagem), o Axios configura o cabeçalho automaticamente
  const isFormData = body instanceof FormData;

  try {
    const response = await api({
      url: endpoint,
      method: method.toLowerCase(),
      data: body,
      headers: {
        ...headers,
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      },
    });

    return response.data;
  } catch (error) {
    if (error.response) {
      // O backend respondeu com um erro (ex: 400, 401, 500)
      const message = error.response.data?.mensagem || error.response.data?.erro || 'Erro na requisição';
      throw new Error(message);
    } else if (error.request) {
      // O servidor não respondeu (backend desligado ou IP incorreto)
      throw new Error('Não foi possível conectar ao servidor. Verifique se a API está ativa.');
    } else {
      throw new Error(error.message);
    }
  }
}

export default api;