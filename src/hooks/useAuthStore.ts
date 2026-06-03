import { create } from 'zustand';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string | null, user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  const initialToken = localStorage.getItem('auth_token');
  let initialUser = null;
  try {
    const userStr = localStorage.getItem('auth_user');
    if (userStr) initialUser = JSON.parse(userStr);
  } catch(e) {}

  return {
    token: initialToken,
    user: initialUser,
    setAuth: (token, user) => {
      if (token && user) {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
      set({ token, user });
    },
    setToken: (token) => {
      if (token) {
        localStorage.setItem('auth_token', token);
      } else {
        localStorage.removeItem('auth_token');
      }
      set({ token });
    },
    logout: () => {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      set({ token: null, user: null });
      window.location.href = '/login';
    }
  };
});
