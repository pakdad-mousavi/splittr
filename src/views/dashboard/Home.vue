<script setup lang="ts">
import Group from '@/components/icons/Group.vue';
import Plus from '@/components/icons/Plus.vue';
import Profile from '@/components/icons/Profile.vue';
import Invite from '@/components/icons/Invite.vue';

import { RouterLink } from 'vue-router';
import { useAuth } from '@/utils/auth';
import { watch, ref } from 'vue';
import { supabase } from '@/utils/supabase';
import { useGroupStore } from '@/stores/groups';
import { useProfileStore } from '@/stores/profiles';

const groupStore = useGroupStore();
const profileStore = useProfileStore();
const getProfile = (id: string | undefined) => {
  return profileStore.profiles.get(id || '');
};

const { user } = useAuth();
const name = ref<string | null>(null);

// Watch for user to be populated, then fetch profile
watch(
  user,
  async (newUser) => {
    if (!newUser?.id) return;

    const { data } = await supabase.from('profiles').select('name').eq('id', newUser.id);

    name.value = data?.[0]?.name as string;
  },
  { immediate: true },
); // immediate: true handles case where user is already set

const getTrimmedFirstname = () => {
  const THRESHOLD = 25;

  const firstname = (name.value as string)?.split(' ')[0];
  const firstnameLength = firstname?.length || 0;
  return firstnameLength > 30 ? firstname?.slice(0, THRESHOLD) + '...' : firstname;
};
</script>

<template>
  <div class="p-4">
    <h2 class="font-playfair text-lg mb-4">Welcome Back, {{ getTrimmedFirstname() || '...' }}.</h2>

    <!-- BALANCE CARD -->
    <div
      class="from-electric-green to-electric-green/80 rounded-md p-4 flex flex-col text-sm text-cursed-black bg-linear-to-br relative mb-4 py-10"
    >
      <span class="uppercase font-medium">Net Balance</span>
      <span class="font-semibold text-4xl font-playfair">RM120.00</span>
    </div>

    <!-- QUICK ACTIONS -->
    <div class="flex justify-between mb-8 text-center">
      <div class="flex flex-col">
        <div
          class="size-12 bg-electric-green rounded-md border border-electric-green/30 hover:border-electric-green duration-200 shadow flex items-center justify-center cursor-pointer"
        >
          <Plus class="stroke-cursed-black"></Plus>
        </div>
        <span class="text-2xs mt-2">EXPENSE</span>
      </div>
      <RouterLink class="flex flex-col" to="/groups">
        <div
          class="size-12 bg-neutral-800 rounded-md border border-electric-green/30 hover:border-electric-green duration-200 shadow flex items-center justify-center cursor-pointer"
        >
          <Group class="stroke-electric-green stroke-1"></Group>
        </div>
        <span class="text-2xs mt-2">GROUPS</span>
      </RouterLink>
      <RouterLink class="flex flex-col" to="/invites">
        <div
          class="size-12 bg-neutral-800 rounded-md border border-electric-green/30 hover:border-electric-green duration-200 shadow flex items-center justify-center cursor-pointer"
        >
          <Invite class="stroke-electric-green stroke-1"></Invite>
        </div>
        <span class="text-2xs mt-2">INVITES</span>
      </RouterLink>
      <RouterLink class="flex flex-col" to="/profile">
        <div
          class="size-12 bg-neutral-800 rounded-md border border-electric-green/30 hover:border-electric-green duration-200 shadow flex items-center justify-center cursor-pointer"
        >
          <Profile class="stroke-electric-green stroke-1"></Profile>
        </div>
        <span class="text-2xs mt-2">PROFILE</span>
      </RouterLink>
    </div>

    <!-- RECENT GROUPS -->
    <div>
      <div class="flex items-end font-playfair mb-4">
        <h3 class="text-lg flex-1">Recent Groups</h3>
      </div>

      <div
        class="border border-electric-green/30 bg-neutral-800 py-8 px-4 text-center text-sm"
        v-if="0"
      >
        No Groups To Show
      </div>

      <div class="space-y-2" v-else>
        <div
          class="bg-neutral-800 p-4 border-l border-neutral-600 hover:border-electric-green duration-200 rounded-md"
          v-for="group in groupStore.groups"
        >
          <div class="flex gap-x-2">
            <div class="w-7/10">
              <h3 class="text-sm uppercase font-semibold">{{ group.name }}</h3>
              <span class="text-xs text-green-100/70">{{ getProfile(group.created_by) }}</span>
            </div>
            <div class="w-3/10 text-right">
              <h3 class="text-sm uppercase">
                {{ groupStore.members[group.id]?.length }} Member(s)
              </h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
