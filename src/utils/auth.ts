import { ref } from 'vue';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';

const user = ref<User | null>(null);
const session = ref<Session | null>(null);

let initialized = false;

export const useAuth = () => {
  if (!initialized) {
    initialized = true;

    supabase.auth.getSession().then(({ data }) => {
      session.value = data.session;
      user.value = data.session?.user ?? null;
    });

    supabase.auth.onAuthStateChange((_event, newSession) => {
      session.value = newSession;
      user.value = newSession?.user ?? null;
    });
  }

  return {
    user,
    session,
  };
};
