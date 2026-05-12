<script setup lang="ts"></script>

<template>
  <div class="relative w-full pt-8 h-screen overflow-hidden px-4 flex flex-col items-center">
    <!-- HIGHLIGHT OVERLAYS -->
    <div class="absolute top-10 -right-10 w-30 h-30 bg-electric-green/15 blur-3xl"></div>
    <div class="absolute bottom-10 -left-10 w-30 h-30 bg-electric-green/15 blur-3xl"></div>

    <!-- TITLE -->
    <div class="mb-8 flex items-center! justify-center gap-x-4">
      <div class="relative size-12">
        <img src="/logo.svg" alt="Logo" class="size-full relative z-10" />
        <div class="absolute left-0 top-0 size-12 bg-electric-green blur-md animate-pulse"></div>
      </div>
      <h1
        class="font-playfair font-bold uppercase tracking-tight text-4xl text-electric-green text-center"
      >
        Splittr
      </h1>
    </div>

    <!-- LOGIN VIEWS -->
    <div class="flex-1 w-full">
      <RouterView></RouterView>
    </div>

    <!-- PRIVACY POLICY, ETC -->
    <div class="mb-2 text-xs max-w-80 w-full">
      <div class="flex uppercase justify-between px-4">
        <span class="opacity-80 hover:opacity-100 duration-200 cursor-pointer">Privacy</span>
        <span class="opacity-80 hover:opacity-100 duration-200 cursor-pointer">Terms</span>
        <span class="opacity-80 hover:opacity-100 duration-200 cursor-pointer">Security</span>
      </div>
      <div
        class="w-full h-px bg-linear-to-r from-transparent via-gray-400/45 to-transparent my-3"
      ></div>
      <span class="block text-center text-xs opacity-40"
        >© {{ new Date().getFullYear() }} Splittr Software</span
      >
    </div>
  </div>
</template>
