<script setup lang="ts">
import GroupCard from '@/components/GroupCard.vue';
import Plus from '@/components/icons/Plus.vue';
import type { Database } from '@/utils/database.types';
import { supabase } from '@/utils/supabase';
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';

type Group = Database['public']['Tables']['groups']['Row'];

const groups = ref<Group[]>([]);

onMounted(async () => {
  // Get the groups that the user is inside of
  const userGroups = await supabase.from('groups').select('*');
  groups.value = userGroups.data || [];
});
</script>

<template>
  <div class="p-4">
    <div class="flex items-center mb-4">
      <div class="flex-1">
        <h2 class="font-playfair text-lg mb-1">My Groups</h2>
        <span class="text-sm text-yellow-50/70 block">Manage your expenses here.</span>
      </div>
      <RouterLink
        class="w-10 h-10 bg-electric-green rounded-md flex items-center justify-center active:translate-y-px duration-200"
        to="/groups/new"
      >
        <Plus class="stroke-cursed-black"></Plus>
      </RouterLink>
    </div>

    <div class="space-y-4">
      <GroupCard :group="group" v-for="group in groups"></GroupCard>
      <!-- <GroupCard :names="['Pakdad', 'Emily', 'Jack']"></GroupCard> -->
      <!-- <GroupCard :names="['Pakdad', 'Emily', 'Jack']"></GroupCard> -->
    </div>
  </div>
</template>
