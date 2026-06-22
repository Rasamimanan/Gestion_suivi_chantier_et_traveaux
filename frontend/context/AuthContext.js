import { createContext, useContext, useEffect, useState } from 'react';
import { login as apiLogin, register as apiRegister } from '../services/api';
import {
  getToken,
  getUser,
  removeToken,
  removeUser,
  saveToken,
  saveUser,
} from '../services/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const storedToken = await getToken();
        const storedUser = await getUser();

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);
        }
      } catch (e) {
        console.log('Auth init error:', e);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const login = async (email, password) => {
    const res = await apiLogin({ email: email.trim().toLowerCase(), password });
    const data = res.data;

    if (!data?.token || !data?.utilisateur) {
      throw new Error('Réponse backend invalide');
    }

    await Promise.all([saveToken(data.token), saveUser(data.utilisateur)]);
    setToken(data.token);
    setUser(data.utilisateur);

    return data;
  };

  // ⚠️ le compte créé reste 'en_attente' tant que l'admin n'a pas validé le compte.
  const register = async (payload) => {
    const res = await apiRegister({
      nom: payload.nom,
      prenom: payload.prenom,
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
      role: payload.role || 'utilisateur',
    });

    return res.data;
  };

  const logout = async () => {
    await Promise.all([removeToken(), removeUser()]);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout, isAuthenticated: !!token }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};