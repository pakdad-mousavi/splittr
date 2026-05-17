<script setup lang="ts">
import { onMounted, ref } from 'vue';
import Dashboard from './icons/Dashboard.vue';
import Group from './icons/Group.vue';
import Profile from './icons/Profile.vue';
import Invite from './icons/Invite.vue';

import { Capacitor } from '@capacitor/core';
const isNative = ref(false);

onMounted(() => {
  const platform = Capacitor.getPlatform();
  isNative.value = platform !== 'web';
});
</script>

<template>
  <nav
    :class="{ 'h-18! pb-2': isNative }"
    class="h-16 w-full fixed bottom-0 bg-cursed-black border-t border-gray-300/15 shadow-2xl shadow-electric-green/50 hover:shadow-electric-green duration-200 animate-navbar-slide-up"
  >
    <div
      class="flex gap-x-2 p-2 text-2xs font-montserrat uppercase text-center text-green-100/40 stroke-green-100/40 font-medium"
    >
      <RouterLink
        class="w-1/4 flex flex-col gap-1 rounded-md items-center p-1 duration-200 hover:text-yellow-50 hover:stroke-yellow-50"
        :to="'/'"
      >
        <Dashboard class="w-4 h-4 duration-200"></Dashboard>
        <span class="scale-90">Dashboard</span>
      </RouterLink>
      <RouterLink
        class="w-1/4 flex flex-col gap-1 rounded-md items-center p-1 duration-200 hover:text-yellow-50 hover:stroke-yellow-50"
        :to="'/groups'"
      >
        <Group class="w-4 h-4 duration-200"></Group>
        <span class="scale-90">Groups</span>
      </RouterLink>
      <RouterLink
        class="w-1/4 flex flex-col gap-1 rounded-md items-center p-1 duration-200 hover:text-yellow-50 hover:stroke-yellow-50"
        :to="'/invites'"
      >
        <Invite class="w-4 h-4 duration-200"></Invite>
        <span class="scale-90">Invites</span>
      </RouterLink>
      <RouterLink
        class="w-1/4 flex flex-col gap-1 rounded-md items-center p-1 duration-200 hover:text-yellow-50 hover:stroke-yellow-50"
        :to="'/profile'"
      >
        <Profile class="w-4 h-4 duration-200"></Profile>
        <span class="scale-90">Profile</span>
      </RouterLink>
    </div>
  </nav>
</template>
