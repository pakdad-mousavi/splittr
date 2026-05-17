<script setup lang="ts">
import { useAuth } from '@/utils/auth';
import { supabase } from '@/utils/supabase';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const { session } = useAuth();

const name = ref('');
const errorText = ref<string | null>(null);

const updateName = async (shouldCheckLength: boolean) => {
  if (shouldCheckLength && name.value.trim().length === 0) {
    errorText.value = 'Please enter your name.';
    return;
  }
  const { error } = await supabase.from('profiles').insert({
    id: session.value?.user.id as string,
    name: name.value || session.value?.user.email || '',
  });

  if (error) {
    errorText.value = error.message;
    return;
  }

  router.push('/');
};
</script>

<template>
  <div
    class="bg-stone-950/30 w-full relative z-10 rounded-md border border-electric-green/30 p-4 flex flex-col max-w-sm mx-auto"
  >
    <h2 class="font-playfair text-xl mb-2 text-center">User Details</h2>
    <span class="text-sm text-yellow-50/70 mb-6 text-center">Let's Get to Know You Better.</span>

    <p class="text-xs mb-2">Name:</p>
    <input
      type="text"
      v-model.trim="name"
      placeholder="John Doe"
      class="focus:border-electric-green/30 outline-none w-full border-neutral-700 border border-md p-3 rounded-md text-base mb-2"
    />
    <button
      class="cursor-pointer text-xs bg-electric-green hover:bg-electric-green/80 rounded-md py-1.5 text-cursed-black flex gap-x-1 justify-center active:translate-y-px duration-200 mb-2"
      @click="updateName(true)"
    >
      Finish signing up
    </button>
    <button
      class="cursor-pointer text-xs border-electric-green hover:border-electric-green/80 border rounded-md py-1.5 flex gap-x-1 justify-center active:translate-y-px duration-200"
      @click="updateName(false)"
    >
      Skip for now
    </button>
    <p class="text-xs mt-2 text-rose-500" v-if="errorText">{{ errorText }}</p>
  </div>
</template>
