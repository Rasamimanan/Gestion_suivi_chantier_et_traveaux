import { createContext, useContext, useEffect, useState } from 'react';
import { login as apiLogin, register as apiRegister } from '../services/api';
import { getToken, getUser, removeToken, removeUser, saveToken, saveUser } from '../services/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [t, u] = await Promise.all([getToken(), getUser()]);
        if (t && u) { setToken(t); setUser(u); }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email, mot_de_passe) => {
    const res = await apiLogin({ email, mot_de_passe });
    const { token: t, user: u } = res.data;
    await Promise.all([saveToken(t), saveUser(u)]);
    setToken(t);
    setUser(u);
    return u;
  };

  const register = async (data) => {
    const res = await apiRegister(data);
    const { token: t, user: u } = res.data;
    await Promise.all([saveToken(t), saveUser(u)]);
    setToken(t);
    setUser(u);
    return u;
  };

  const logout = async () => {
    await Promise.all([removeToken(), removeUser()]);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
