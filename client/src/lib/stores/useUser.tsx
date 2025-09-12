import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@shared/schema";

interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (displayName: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  submitScore: (score: number) => Promise<boolean>;
}

export const useUser = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,
      
      login: async (displayName: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ displayName }),
          });
          
          const data = await response.json();
          
          if (!response.ok) {
            set({ error: data.error || 'Login failed', isLoading: false });
            return false;
          }
          
          set({ user: data.user, isLoading: false, error: null });
          return true;
        } catch (error) {
          set({ error: 'Network error', isLoading: false });
          return false;
        }
      },
      
      
      logout: () => {
        set({ user: null, error: null });
      },
      
      clearError: () => {
        set({ error: null });
      },
      
      submitScore: async (score: number) => {
        const { user } = get();
        if (!user) {
          set({ error: 'You must be logged in to submit scores' });
          return false;
        }
        
        try {
          const response = await fetch('/api/scores', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: user.id, score }),
          });
          
          if (!response.ok) {
            const data = await response.json();
            set({ error: data.error || 'Failed to submit score' });
            return false;
          }
          
          return true;
        } catch (error) {
          set({ error: 'Network error while submitting score' });
          return false;
        }
      },
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);