import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface User {
  id: string;
  email: string;
  created_at: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setTokens: (accessToken: string, refreshToken: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        const res = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.detail || 'Login failed');
        }
        
        const data = await res.json();
        set({ accessToken: data.access_token, refreshToken: data.refresh_token });
        
        const userRes = await fetch(`${API_URL}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${data.access_token}` },
        });
        
        if (userRes.ok) {
          const userData = await userRes.json();
          set({ user: userData, isAuthenticated: true });
        }
      },

      register: async (email: string, password: string) => {
        const res = await fetch(`${API_URL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.detail || 'Registration failed');
        }
        
        const data = await res.json();
        set({ accessToken: data.access_token, refreshToken: data.refresh_token });
        
        const userRes = await fetch(`${API_URL}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${data.access_token}` },
        });
        
        if (userRes.ok) {
          const userData = await userRes.json();
          set({ user: userData, isAuthenticated: true });
        }
      },

      logout: async () => {
        const { refreshToken } = get();
        if (refreshToken) {
          try {
            await fetch(`${API_URL}/api/auth/logout`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refresh_token: refreshToken }),
            });
          } catch (e) {
            console.error('Logout error:', e);
          }
        }
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
        
        // Clear player state in localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('podcast_current_episode');
        }
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) {
          throw new Error('No refresh token');
        }
        
        const res = await fetch(`${API_URL}/api/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
        
        if (!res.ok) {
          set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
          throw new Error('Token refresh failed');
        }
        
        const data = await res.json();
        set({ accessToken: data.access_token, refreshToken: data.refresh_token });
      },

      checkAuth: async () => {
        const { accessToken, refreshToken } = get();
        
        if (!accessToken || !refreshToken) {
          set({ isAuthenticated: false });
          return;
        }
        
        try {
          const res = await fetch(`${API_URL}/api/auth/me`, {
            headers: { 'Authorization': `Bearer ${accessToken}` },
          });
          
          if (res.ok) {
            const userData = await res.json();
            set({ user: userData, isAuthenticated: true });
          } else {
            await get().refreshAccessToken();
          }
        } catch (e) {
          try {
            await get().refreshAccessToken();
          } catch {
            set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
          }
        }
      },

      setTokens: (accessToken: string, refreshToken: string) => {
        set({ accessToken, refreshToken });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);