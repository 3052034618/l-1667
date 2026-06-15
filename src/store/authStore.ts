import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole } from '../types';

export type { UserRole };

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  rememberMe: boolean;
  login: (username: string, password: string, role: UserRole, remember?: boolean) => Promise<boolean>;
  logout: () => void;
  setRememberMe: (value: boolean) => void;
  hasRole: (roles: UserRole[]) => boolean;
}

type TestAccount = {
  username: string;
  password: string;
  role: UserRole;
  userData: Omit<User, 'id' | 'createdAt' | 'lastLoginAt'>;
};

const TEST_ACCOUNTS: TestAccount[] = [
  {
    username: 'phd',
    password: '123456',
    role: 'phd_student',
    userData: {
      username: 'phd',
      email: 'phd@topo.ac.cn',
      realName: '张博士',
      role: 'phd_student',
      groupId: 'group-001',
      avatar: '',
    },
  },
  {
    username: 'supervisor',
    password: '123456',
    role: 'supervisor',
    userData: {
      username: 'supervisor',
      email: 'supervisor@topo.ac.cn',
      realName: '李导师',
      role: 'supervisor',
      groupId: 'group-001',
      avatar: '',
    },
  },
  {
    username: 'chief',
    password: '123456',
    role: 'chief_scientist',
    userData: {
      username: 'chief',
      email: 'chief@topo.ac.cn',
      realName: '王首席',
      role: 'chief_scientist',
      groupId: 'group-all',
      avatar: '',
    },
  },
  {
    username: 'admin',
    password: '123456',
    role: 'admin',
    userData: {
      username: 'admin',
      email: 'admin@topo.ac.cn',
      realName: '赵管理员',
      role: 'admin',
      groupId: 'system',
      avatar: '',
    },
  },
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      rememberMe: false,

      login: async (username, password, role, remember = false) => {
        await new Promise((resolve) => setTimeout(resolve, 600));

        const account = TEST_ACCOUNTS.find(
          (a) => a.username === username && a.password === password && a.role === role
        );

        if (account) {
          const now = new Date().toISOString();
          const user: User = {
            ...account.userData,
            id: crypto.randomUUID(),
            createdAt: now,
            lastLoginAt: now,
          };
          set({
            user,
            isAuthenticated: true,
            rememberMe: remember,
          });
          return true;
        }
        return false;
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      setRememberMe: (value) => set({ rememberMe: value }),

      hasRole: (roles) => {
        const { user } = get();
        if (!user) return false;
        return roles.includes(user.role);
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) =>
        state.rememberMe
          ? {
              user: state.user,
              isAuthenticated: state.isAuthenticated,
              rememberMe: state.rememberMe,
            }
          : { rememberMe: state.rememberMe },
    }
  )
);
