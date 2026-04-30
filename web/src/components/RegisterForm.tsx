'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/lib/api';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export default function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register, accessToken } = useAuthStore();
  
  const migrateGuestData = async (token: string) => {
    const localPodcasts = localStorage.getItem('podcast_stats_podcasts');
    const localEvents = localStorage.getItem('podcast_stats_events');
    const localPositions = localStorage.getItem('podcast_stats_positions');
    
    if (!localPodcasts && !localEvents && !localPositions) {
      return;
    }
    
    const data: any = {};
    
    if (localPodcasts) {
      try {
        data.podcasts = JSON.parse(localPodcasts);
      } catch (e) {
        console.error('Failed to parse podcasts:', e);
      }
    }
    
    if (localEvents) {
      try {
        data.events = JSON.parse(localEvents);
      } catch (e) {
        console.error('Failed to parse events:', e);
      }
    }
    
    if (localPositions) {
      try {
        data.positions = JSON.parse(localPositions);
      } catch (e) {
        console.error('Failed to parse positions:', e);
      }
    }
    
    if (Object.keys(data).length > 0) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/stats/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });
        
        localStorage.removeItem('podcast_stats_podcasts');
        localStorage.removeItem('podcast_stats_events');
        localStorage.removeItem('podcast_stats_positions');
        localStorage.removeItem('podcast_stats_user');
      } catch (e) {
        console.error('Failed to migrate guest data:', e);
      }
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await register(email, password);
      
      const token = useAuthStore.getState().accessToken;
      if (token) {
        await migrateGuestData(token);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Create Account</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-blue-500 hover:underline"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}