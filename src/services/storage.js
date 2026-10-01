import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveToken = async (token) => {
  try {
    await AsyncStorage.setItem('@sabor_digital_token', token);
  } catch (error) {
    console.error('Erro ao salvar token:', error);
  }
};

export const getToken = async () => {
  try {
    return await AsyncStorage.getItem('@sabor_digital_token');
  } catch (error) {
    console.error('Erro ao buscar token:', error);
    return null;
  }
};

export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem('@sabor_digital_token');
  } catch (error) {
    console.error('Erro ao remover token:', error);
  }
};