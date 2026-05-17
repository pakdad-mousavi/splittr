<script setup lang="ts">
import { useProfileStore } from '@/stores/profiles';
import { useAuth } from '@/utils/auth';
import { supabase } from '@/utils/supabase';
import { computed, ref, watchEffect } from 'vue';
import { useRouter } from 'vue-router';

const { user } = useAuth();
const profileStore = useProfileStore();
const router = useRouter();

const name = computed(() => profileStore.profiles.get(user.value?.id || ''));

const username = ref(name.value);
const errorText = ref<string | null>(null);
const successText = ref<string | null>(null);

watchEffect(() => {
  username.value = name.value;
});

const updateUsername = async () => {
  if (!username.value || username.value.trim().length <= 0) {
    successText.value = null;
    errorText.value = 'Please enter your new username.';
    return;
  }

  if (username.value.trim() === name.value) {
    successText.value = null;
    errorText.value = 'Please enter a different username.';
    return;
  }

  const { error } = await supabase
    .from('profiles')
    .update({ name: username.value })
    .eq('id', user.value?.id || '');

  if (error) {
    successText.value = null;
    errorText.value = error.message;
    return;
  }

  errorText.value = null;
  successText.value = 'Successfully updated profile!';

  await profileStore.updateProfiles();
};

const signOut = async () => {
  await supabase.auth.signOut();
  router.push('/login');
};

const deleteButtonText = ref('Delete Account');
const clicks = ref(0);
const deleteAccount = async () => {
  clicks.value++;
  if (clicks.value < 2) {
    deleteButtonText.value = 'Click Again to Confirm';
    return;
  }

  deleteButtonText.value = 'Deleting...';

  const profileDel = await supabase
    .from('profiles')
    .delete()
    .eq('id', user.value?.id || '');

  if (profileDel.error) {
    successText.value = '123';
    errorText.value = profileDel.error.message;
    return;
  }

  // DUMMY DELETE
  await signOut();
};
</script>

<template>
  <div class="p-4">
    <div class="mb-4">
      <h2 class="font-playfair text-lg mb-1">My Profile</h2>
      <span class="text-sm text-yellow-50/70 block">Take control of your identity.</span>
    </div>

    <div class="border border-neutral-600 bg-neutral-800 rounded-md p-4 flex flex-col mb-4">
      <p class="text-xs mb-2">Username:</p>
      <input
        type="text"
        v-model.trim="username"
        class="focus:border-electric-green/30 outline-none w-full border-neutral-700 border border-md p-3 rounded-md text-base mb-2"
      />
      <button
        class="cursor-pointer text-xs bg-electric-green hover:bg-electric-green/80 rounded-md py-1.5 text-cursed-black flex gap-x-1 justify-center active:translate-y-px duration-200 mb-2"
        @click="updateUsername"
      >
        <span>Update Username</span>
      </button>
      <div class="flex gap-x-2">
        <button
          class="cursor-pointer text-xs border border-rose-500 rounded-md py-1.5 text-rose-500 flex gap-x-1 justify-center active:translate-y-px duration-200 w-1/2"
          @click="signOut"
        >
          <span>Sign Out</span>
        </button>
        <button
          class="cursor-pointer text-xs bg-rose-500/80 hover:bg-rose-500/60 rounded-md py-1.5 text-yellow-50 flex gap-x-1 justify-center active:translate-y-px duration-200 w-1/2"
          @click="deleteAccount"
        >
          <span>{{ deleteButtonText }}</span>
        </button>
      </div>

      <p class="mt-2 text-rose-500 text-xs" v-if="errorText">{{ errorText }}</p>
      <p class="mt-2 text-electric-green text-xs" v-if="successText">{{ successText }}</p>
    </div>
  </div>
</template>
