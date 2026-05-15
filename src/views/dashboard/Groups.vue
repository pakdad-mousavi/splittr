<script setup lang="ts">
import GroupCard from '@/components/GroupCard.vue';
import Group from '@/components/icons/Group.vue';
import Plus from '@/components/icons/Plus.vue';
import type { Database } from '@/utils/database.types';
import { supabase } from '@/utils/supabase';
import { computed, onMounted, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';

type TGroup = Database['public']['Tables']['groups']['Row'];
const router = useRouter();

const groups = ref<TGroup[]>([]);
const currentGroup = computed(() => {
  const currentGroupId = router.currentRoute.value.params.id as string | undefined;
  if (!currentGroupId) return undefined;

  return groups.value.find((g) => g.id === Number(currentGroupId));
});

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
    </div>

    <!-- GROUP PANEL -->
    <Transition name="slide-in">
      <div
        v-if="currentGroup"
        class="h-[calc(100vh-128px)] bg-neutral-800/30 backdrop-blur-xl absolute top-16 left-0 w-full z-50 rounded-md p-4 overflow-y-scroll"
      >
        <div class="p-4 bg-neutral-800 border border-neutral-600 flex flex-col">
          <div class="flex items-center">
            <div class="flex-1">
              <span class="text-xs text-electric-green">Group Invite Code</span>
            </div>
            <div class="flex flex-col items-end">
              <div class="flex items-center gap-x-2">
                <Group class="stroke-yellow-50 size-4"></Group>
                <span class="text-xs">Members</span>
              </div>
              <span>{{ currentGroup.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<!-- USE VUE STYLE TAG TO DEFINE ANIMATION -->
<style>
/* 1. Define the starting and ending state for the entering/leaving */
.slide-in-enter-from,
.slide-in-leave-to {
  transform: translateX(-100%);
}

/* 2. Define the transition timing and properties */
.slide-in-enter-active,
.slide-in-leave-active {
  transition: all 0.25s ease-in-out;
}

/* 3. The 'to' state for enter and 'from' state for leave (default) */
.slide-in-enter-to,
.slide-in-leave-from {
  transform: translateX(0);
}
</style>
