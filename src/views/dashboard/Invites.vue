<script setup lang="ts">
import type { Database } from '@/utils/database.types';
import { supabase } from '@/utils/supabase';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

type Invite = Database['public']['Tables']['invitations']['Row'];
const invites = ref<Invite[]>([]);
const router = useRouter();

const updateInvites = async () => {
  const { data, error } = await supabase.from('invitations').select('*');
  if (error) {
    console.log(error);
    return;
  }

  invites.value = data;
};

onMounted(async () => {
  await updateInvites();
});

const errorText = ref<string | null>(null);
const successText = ref<string | null>(null);
const accept = async (invite: Invite) => {
  const data = await supabase.functions.invoke('accept-invite', {
    body: { token: invite.token },
  });

  if (data.error) {
    errorText.value = 'An error occured';
    console.log(data);
    return;
  }

  errorText.value = null;
  successText.value = 'Successfully joined group.';

  await updateInvites();
  router.push('/groups');
};
</script>

<template>
  <div class="p-4">
    <div class="mb-4">
      <h2 class="font-playfair text-lg mb-1">My Invites</h2>
      <span class="text-sm text-yellow-50/70 block">Manage invites to other groups here.</span>
    </div>
    <div
      class="bg-neutral-800 rounded-md border border-neutral-600 p-4 text-sm font-playfair flex gap-x-2 cursor-pointer"
      v-for="invite in invites"
      @click="accept(invite)"
    >
      <span class="flex-1">Accept invite to group with ID:</span>
      <span class="text-electric-green font-montserrat">{{ invite.group_id }}</span>
    </div>
    <span v-if="errorText" class="text-xs text-rose-500">{{ errorText }}</span>
    <span v-if="successText" class="text-xs text-electric-green">{{ successText }}</span>
    <div v-if="invites.length <= 0">NO INVITES FOUND</div>
  </div>
</template>
