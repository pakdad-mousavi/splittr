import type { Database } from '@/utils/database.types';
import { supabase } from '@/utils/supabase';
import type { Session } from '@supabase/supabase-js';
import { defineStore } from 'pinia';

type Group = Database['public']['Tables']['groups']['Row'];
type Member = Database['public']['Tables']['group_members']['Row'];

export const useGroupStore = defineStore('groups', {
  state: () => {
    return {
      initialized: false,
      groups: [] as Group[],
      members: {} as Record<number, Member[]>,
    };
  },

  actions: {
    async updateGroups() {
      const groupsRes = await supabase.from('groups').select('*');
      if (groupsRes.error) return;

      this.groups = groupsRes.data;
    },

    async updateMembers() {
      const groupMembers = await supabase.from('group_members').select('*');
      if (groupMembers.error) return;

      this.members = Object.groupBy(groupMembers.data, ({ group_id }) => group_id) as Record<
        number,
        Member[]
      >;
    },

    async init() {
      if (this.initialized) return;

      const res = await supabase.auth.getSession();
      if (!res.data.session) return;

      await this.updateGroups();
      await this.updateMembers();

      this.initialized = true;
    },
  },
});
