<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Capacitor } from '@capacitor/core';

const isNative = ref(false);

onMounted(() => {
  const platform = Capacitor.getPlatform();
  isNative.value = platform !== 'web';
});
</script>

<template>
  <div class="fixed top-0 left-0 w-full h-16 bg-cursed-black z-100" v-if="isNative"></div>
  <header
    :class="{ 'top-16!': isNative }"
    class="p-4 border-gray-300/15 border-b h-16 fixed top-0 w-full bg-cursed-black z-100 max-w-lg"
  >
    <div class="flex items-center">
      <div class="flex gap-x-4 items-center mr-auto">
        <img src="/logo.svg" alt="Logo" class="w-7 h-7" />
        <h1 class="font-playfair font-bold uppercase tracking-tight text-2xl text-electric-green">
          Splittr
        </h1>
      </div>
      <div
        class="w-6 h-6 rounded-full border border-electric-green bg-electric-green/20 flex items-center justify-center text-sm"
      >
        P
      </div>
    </div>
  </header>
</template>
