import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole } from '../types';
import api from '../lib/axios';

export type { UserRole };

const TOKEN_KEY = 'topoflow_token';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  rememberMe: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  setRememberMe: (value: boolean) => void;
  hasRole: (roles: UserRole[]) => boolean;
  fetchCurrentUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      rememberMe: false,

      login: async (username, password) => {
        try {
          const response = await api.post('/auth/login', { username, password });
          const { success, message, data } = response.data;

          if (success && data) {
            const { user, accessToken } = data;
            localStorage.setItem(TOKEN_KEY, accessToken);
            set({
              user,
              token: accessToken,
              isAuthenticated: true,
            });
            return { success: true, message: message || '登录成功' };
          }
          return { success: false, message: message || '登录失败' };
        } catch (error: any) {
          const message = error.response?.data?.message || error.message || '登录失败，请稍后重试';
          return { success: false, message };
        }
      },

      logout: () => {
        localStorage.removeItem(TOKEN_KEY);
        set({ user: null, token: null, isAuthenticated: false });
      },

      setRememberMe: (value) => set({ rememberMe: value }),

      hasRole: (roles) => {
        const { user } = get();
        if (!user) return false;
        return roles.includes(user.role);
      },

      fetchCurrentUser: async () => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) {
          set({ isAuthenticated: false, user: null, token: null });
          return;
        }

        try {
          const response = await api.get('/auth/me');
          const { success, data } = response.data;
          if (success && data) {
            set({ user: data, token, isAuthenticated: true });
          } else {
            localStorage.removeItem(TOKEN_KEY);
            set({ isAuthenticated: false, user: null, token: null });
          }
        } catch {
          localStorage.removeItem(TOKEN_KEY);
          set({ isAuthenticated: false, user: null, token: null });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) =>
        state.rememberMe
          ? {
              user: state.user,
              isAuthenticated: state.isAuthenticated,
              token: state.token,
              rememberMe: state.rememberMe,
            }
          : { rememberMe: state.rememberMe },
    }
  )
);

const initAuth = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    useAuthStore.getState().fetchCurrentUser();
  }
};

initAuth();
