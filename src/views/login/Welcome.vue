<script setup lang="ts">
import Email from '@/components/icons/Email.vue';
import { supabase } from '@/utils/supabase';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const email = ref('');
const errorText = ref<string | null>(null);
const router = useRouter();

// Handle email signups / logins
const onContinueWithEmail = async () => {
  if (email.value.length === 0) {
    errorText.value = 'Please enter your email.';
    return;
  }

  const { error } = await supabase.auth.signInWithOtp({
    email: email.value,
  });

  if (error) {
    errorText.value = error.message;
    console.log(error);
    return;
  }

  router.push(`/login/otp?email=${email.value}`);
};
</script>

<template>
  <div
    class="bg-stone-950/30 w-full relative z-10 rounded-md border border-electric-green/30 p-4 flex flex-col max-w-sm mx-auto"
  >
    <h2 class="font-playfair text-xl mb-2 text-center">Welcome Back</h2>
    <span class="text-sm text-yellow-50/70 mb-6 text-center"> Split bills. Not friendships. </span>

    <p class="text-xs mb-2">Email Address:</p>
    <input
      type="email"
      v-model.trim="email"
      placeholder="john.doe@example.com"
      class="focus:border-electric-green/30 outline-none w-full border-neutral-700 border border-md p-1.5 rounded-md text-xs mb-2"
    />
    <button
      class="cursor-pointer text-xs bg-electric-green hover:bg-electric-green/80 rounded-md py-1.5 text-cursed-black flex gap-x-1 justify-center active:translate-y-px duration-200"
      @click="onContinueWithEmail"
    >
      <Email class="stroke-cursed-black w-4 h-4 stroke-1!"></Email>
      <span class="">Continue with Email</span>
    </button>
    <span v-if="errorText" class="text-red-500 text-xs mt-2">{{ errorText }}</span>

    <div class="flex items-center justify-center gap-x-4 my-6">
      <div class="w-full h-px bg-gray-300/20"></div>
      <span class="text-gray-300/40 text-sm">OR</span>
      <div class="w-full h-px bg-gray-300/20"></div>
    </div>

    <div class="flex flex-col gap-y-2">
      <button
        class="cursor-pointer text-xs bg-neutral-800 hover:bg-neutral-800/80 rounded-md py-3 flex gap-x-1 justify-center active:translate-y-px duration-200 border border-electric-green/30"
      >
        <span class="">Sign in with James</span>
      </button>
      <button
        class="cursor-pointer text-xs bg-neutral-800 hover:bg-neutral-800/80 rounded-md py-3 flex gap-x-1 justify-center active:translate-y-px duration-200 border border-electric-green/30"
      >
        <span class="">Sign in with Emily</span>
      </button>
      <button
        class="cursor-pointer text-xs bg-neutral-800 hover:bg-neutral-800/80 rounded-md py-3 flex gap-x-1 justify-center active:translate-y-px duration-200 border border-electric-green/30"
      >
        <span class="">Sign in with Gray</span>
      </button>
    </div>
  </div>
</template>
