import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const NGROK_SKIP_HEADER = { 'ngrok-skip-browser-warning': 'true' };

// Sync local stats events to backend
async function syncLocalStats(token: string) {
  try {
    const events = JSON.parse(localStorage.getItem('podcast_stats_events') || '[]');
    if (events.length === 0) return;
    
    const eventsToSync = events.map((e: any) => ({
      episode_id: e.episode_id,
      podcast_id: e.podcast_id,
      event_type: e.event_type,
      position_seconds: e.position_seconds,
      session_id: e.session_id,
    }));
    
    await fetch(`${API_URL}/api/stats/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...NGROK_SKIP_HEADER
      },
      body: JSON.stringify({ events: eventsToSync })
    });
  } catch (e) {
    console.error('Failed to sync local stats:', e);
  }
}

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
          headers: { 'Content-Type': 'application/json', ...NGROK_SKIP_HEADER },
          body: JSON.stringify({ email, password }),
        });
        
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.detail || 'Login failed');
        }
        
        const data = await res.json();
        set({ accessToken: data.access_token, refreshToken: data.refresh_token });
        
        const userRes = await fetch(`${API_URL}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${data.access_token}`, ...NGROK_SKIP_HEADER },
        });
        
        if (userRes.ok) {
          const userData = await userRes.json();
          set({ user: userData, isAuthenticated: true });
          
          // Sync local stats to backend
          syncLocalStats(data.access_token);
        }
      },

      register: async (email: string, password: string) => {
        const res = await fetch(`${API_URL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...NGROK_SKIP_HEADER },
          body: JSON.stringify({ email, password }),
        });
        
        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.detail || 'Registration failed');
        }
        
        const data = await res.json();
        set({ accessToken: data.access_token, refreshToken: data.refresh_token });
        
        const userRes = await fetch(`${API_URL}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${data.access_token}`, ...NGROK_SKIP_HEADER },
        });
        
        if (userRes.ok) {
          const userData = await userRes.json();
          set({ user: userData, isAuthenticated: true });
          
          // Sync local stats to backend
          syncLocalStats(data.access_token);
        }
      },

      logout: async () => {
        const { refreshToken } = get();
        if (refreshToken) {
          try {
            await fetch(`${API_URL}/api/auth/logout`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', ...NGROK_SKIP_HEADER },
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
          headers: { 'Content-Type': 'application/json', ...NGROK_SKIP_HEADER },
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
            headers: { 'Authorization': `Bearer ${accessToken}`, ...NGROK_SKIP_HEADER },
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