import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { ReputationEvent } from '../lib/reputation';

interface ReputationState {
  events: ReputationEvent[];
  loading: boolean;
  error: string | null;
  fetchMyReputation: () => Promise<void>;
}

export const useReputationStore = create<ReputationState>((set) => ({
  events: [],
  loading: false,
  error: null,

  fetchMyReputation: async () => {
    try {
      set({ loading: true, error: null });
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!authData.user) throw new Error('Sign in to view your reputation');
      const { data, error } = await supabase
        .from('reputation_events')
        .select('*')
        .eq('user_id', authData.user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      set({ events: data || [] });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Could not load reputation' });
    } finally {
      set({ loading: false });
    }
  },
}));
