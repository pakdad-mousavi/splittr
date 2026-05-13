<script setup lang="ts">
import Header from '@/components/Header.vue';
import { useAuth } from '@/utils/auth';

const { session } = useAuth();
</script>

<template>
  <Header v-if="!!session"></Header>
  <RouterView></RouterView>
</template>
