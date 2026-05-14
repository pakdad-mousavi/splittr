<script setup lang="ts">
import Group from '@/components/icons/Group.vue';
import Minus from '@/components/icons/Minus.vue';
import Plus from '@/components/icons/Plus.vue';
import Profile from '@/components/icons/Profile.vue';
import Scan from '@/components/icons/Scan.vue';

import { RouterLink } from 'vue-router';
import { useAuth } from '@/utils/auth';

const { user } = useAuth();

const getTrimmedFirstname = () => {
  const THRESHOLD = 25;

  const firstname = (user.value?.user_metadata.name as string).split(' ')[0];
  const firstnameLength = firstname?.length || 0;
  return firstnameLength > 30 ? firstname?.slice(0, THRESHOLD) + '...' : firstname;
};
</script>

<template>
  <div class="p-4">
    <h2 class="font-playfair text-lg mb-4">Welcome Back, {{ getTrimmedFirstname() }}.</h2>

    <!-- BALANCE CARD -->
    <div
      class="from-electric-green to-electric-green/80 rounded-md p-4 flex flex-col text-sm text-cursed-black bg-linear-to-br relative mb-4"
    >
      <span class="uppercase font-medium">Net Balance</span>
      <span class="font-semibold text-4xl font-playfair mb-4">RM120.00</span>
      <hr class="opacity-20 mb-2" />
      <div class="flex flex-wrap mb-2">
        <div class="flex flex-1 items-center gap-x-2">
          <Minus class="stroke-cursed-black w-4 h-4"></Minus>
          <span>You owe</span>
        </div>
        <span>RM32.00</span>
      </div>
      <hr class="opacity-20 mb-2" />
      <div class="flex flex-wrap mb-2">
        <div class="flex flex-1 items-center gap-x-2">
          <Plus class="stroke-cursed-black w-4 h-4"></Plus>
          <span>You are owed</span>
        </div>
        <span>RM152.00</span>
      </div>
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
      <div class="flex flex-col">
        <div
          class="size-12 bg-neutral-800 rounded-md border border-electric-green/30 hover:border-electric-green duration-200 shadow flex items-center justify-center cursor-pointer"
        >
          <Scan class="stroke-electric-green stroke-1"></Scan>
        </div>
        <span class="text-2xs mt-2">SCAN</span>
      </div>
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
        <span class="text-sm text-electric-green underline cursor-pointer">View all</span>
      </div>

      <div
        class="border border-electric-green/30 bg-neutral-800 py-8 px-4 text-center text-sm"
        v-if="0"
      >
        No Groups To Show
      </div>

      <div class="space-y-2" v-else>
        <div
          class="bg-neutral-800 p-4 border-l border-neutral-600 hover:border-electric-green duration-200"
        >
          <div class="flex gap-x-2">
            <div class="w-7/10">
              <h3 class="text-sm uppercase font-semibold">College Dinner</h3>
              <span class="text-xs text-green-100/70">22 Oct, 2026</span>
            </div>
            <div class="w-3/10 text-right">
              <h3 class="text-sm uppercase">RM 186.00</h3>
              <span class="text-xs text-electric-green">Settled</span>
            </div>
          </div>
        </div>
        <div
          class="bg-neutral-800 p-4 border-l border-neutral-600 hover:border-electric-green duration-200"
        >
          <div class="flex gap-x-2">
            <div class="w-7/10">
              <h3 class="text-sm uppercase font-semibold">Friendly Brunch</h3>
              <span class="text-xs text-green-100/70">22 Oct, 2026</span>
            </div>
            <div class="w-3/10 text-right">
              <h3 class="text-sm uppercase">RM 23.00</h3>
              <span class="text-xs text-red-500">Pending</span>
            </div>
          </div>
        </div>
        <div
          class="bg-neutral-800 p-4 border-l border-neutral-600 hover:border-electric-green duration-200"
        >
          <div class="flex gap-x-2">
            <div class="w-7/10">
              <h3 class="text-sm uppercase font-semibold">Afternoon Gym</h3>
              <span class="text-xs text-green-100/70">22 Oct, 2026</span>
            </div>
            <div class="w-3/10 text-right">
              <h3 class="text-sm uppercase">RM 285.00</h3>
              <span class="text-xs text-electric-green">Settled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
