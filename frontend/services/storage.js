import * as SecureStore from 'expo-secure-store';

export const saveToken = async (token) => {
  await SecureStore.setItemAsync('auth_token', token);
};

export const getToken = async () => {
  return await SecureStore.getItemAsync('auth_token');
};

export const removeToken = async () => {
  await SecureStore.deleteItemAsync('auth_token');
};

export const saveUser = async (user) => {
  await SecureStore.setItemAsync('user_data', JSON.stringify(user));
};

export const getUser = async () => {
  const data = await SecureStore.getItemAsync('user_data');
  return data ? JSON.parse(data) : null;
};

export const removeUser = async () => {
  await SecureStore.deleteItemAsync('user_data');
};
