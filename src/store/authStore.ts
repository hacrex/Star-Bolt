import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { Database } from '../lib/database.types';

type UserProfile = Database['public']['Tables']['users']['Row'];

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  loading: true,
  signIn: async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  },
  signUp: async (email: string, password: string, username: string) => {
    const { error: signUpError, data } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username: username.trim() } },
    });
    if (signUpError) throw signUpError;

    if (data.user && data.session) {
      const { error: profileError } = await supabase
        .from('users')
        .upsert([{ id: data.user.id, username: username.trim() }], { onConflict: 'id' });
      if (profileError) throw profileError;
    }

    return Boolean(data.session);
  },
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    set({ user: null, profile: null });
  },
  loadUser: async () => {
    try {
      set({ loading: true });
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        set({ user, profile });
      }
    } finally {
      set({ loading: false });
    }
  },
}));

// Listen for auth state changes in real-time
supabase.auth.onAuthStateChange(async (_event, session) => {
  const currentUser = session?.user ?? null;
  useAuthStore.setState({ user: currentUser });

  if (currentUser) {
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', currentUser.id)
      .single();
    useAuthStore.setState({ profile });
  } else {
    useAuthStore.setState({ profile: null });
  }
});