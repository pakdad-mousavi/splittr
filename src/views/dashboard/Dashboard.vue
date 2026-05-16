<script setup lang="ts">
import Header from '@/components/Header.vue';
import Navbar from '@/components/Navbar.vue';
import { useGroupStore } from '@/stores/groups';
import { useProfileStore } from '@/stores/profiles';
import { useAuth } from '@/utils/auth';
import { onMounted } from 'vue';

const { session } = useAuth();
const groupStore = useGroupStore();
const profileStore = useProfileStore();

onMounted(async () => {
  await groupStore.init();
  await profileStore.init();
});
</script>

<template>
  <div class="min-h-screen flex flex-col h-full relative">
    <div
      class="absolute top-20 -right-10 w-30 h-30 bg-electric-green/10 blur-3xl z-1000 pointer-events-none"
    ></div>
    <div
      class="absolute bottom-20 -left-10 w-30 h-30 bg-electric-green/10 blur-3xl z-1000 pointer-events-none"
    ></div>

    <Header v-if="!!session"></Header>
    <div class="my-16">
      <RouterView></RouterView>
    </div>
    <Navbar></Navbar>
  </div>
</template>
