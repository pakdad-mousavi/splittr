<script setup lang="ts">
import Header from './components/Header.vue';
import { useAuth } from '@/utils/auth';

const { session } = useAuth();
</script>

<template>
  <main
    class="bg-cursed-black min-h-screen bg-[repeating-radial-gradient(var(--color-zinc-900)_0,var(--color-zinc-900)_1px,transparent_1px,transparent_100%)] bg-size-[20px_20px] bg-fixed overflow-hidden"
  >
    <Header v-if="!!session"></Header>
    <RouterView></RouterView>
  </main>
</template>
