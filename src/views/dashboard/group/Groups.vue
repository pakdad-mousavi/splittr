<script setup lang="ts">
import GroupCard from '@/components/GroupCard.vue';
import Copy from '@/components/icons/Copy.vue';
import Plus from '@/components/icons/Plus.vue';
import Scan from '@/components/icons/Scan.vue';
import Trash from '@/components/icons/Trash.vue';
import { useGroupStore } from '@/stores/groups';
import { RouterLink } from 'vue-router';

const groupStore = useGroupStore();
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
      <GroupCard :group="group" v-for="group in groupStore.groups"></GroupCard>
    </div>
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
