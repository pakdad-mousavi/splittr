import { supabase } from '@/utils/supabase';
import { defineStore } from 'pinia';

export const useProfileStore = defineStore('profiles', {
  state: () => {
    return {
      initialized: false,
      profiles: new Map<string, string>(),
    };
  },

  actions: {
    async updateProfiles() {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) return;

      for (const profile of data) {
        this.profiles.set(profile.id, profile.name);
      }
    },

    async init() {
      if (this.initialized) return;

      const res = await supabase.auth.getSession();
      if (!res.data.session) return;

      await this.updateProfiles();

      this.initialized = true;
    },
  },
});
