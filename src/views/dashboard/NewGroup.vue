<script setup lang="ts">
import Arrow from '@/components/icons/Arrow.vue';
import { useGroupStore } from '@/stores/groups';
import { useAuth } from '@/utils/auth';
import { supabase } from '@/utils/supabase';
import { ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';

const { user } = useAuth();
const router = useRouter();
const groupStore = useGroupStore();

const name = ref();
const errorText = ref<string | null>(null);

const createGroup = async () => {
  const groupInsertRes = await supabase
    .from('groups')
    .insert({ name: name.value, created_by: user.value?.id || '' })
    .select()
    .single();
  if (groupInsertRes.error) {
    errorText.value = groupInsertRes.error.message;
    return;
  }

  const groupMemberInsertRes = await supabase
    .from('group_members')
    .insert({ group_id: groupInsertRes.data.id, user_id: user.value?.id || '' });

  if (groupMemberInsertRes.error) {
    errorText.value = groupMemberInsertRes.error.message;
    return;
  }

  // Update both groups and members
  await groupStore.updateGroups();
  await groupStore.updateMembers();
  router.push('/groups');
};
</script>

<template>
  <div class="p-4">
    <RouterLink to="/groups">
      <div class="border-b border-yellow-50 inline-block">
        <div class="flex gap-x-1 items-center text-xs">
          <Arrow class="rotate-180 stroke-yellow-50 size-4"></Arrow>
          <span>Back To Groups</span>
        </div>
      </div>
    </RouterLink>
    <div class="bg-neutral-800 border border-neutral-600 p-4 rounded-md max-w-lg mx-auto mt-4">
      <div class="text-center mb-4">
        <h2 class="font-playfair text-lg mb-1">Create Group</h2>
        <span class="text-sm text-yellow-50/70 block">A new group awaits you.</span>
      </div>

      <div class="flex flex-col w-full">
        <p class="text-xs mb-2">Group Name:</p>
        <input
          type="text"
          v-model="name"
          class="focus:border-electric-green/30 outline-none w-full border-neutral-700 border border-md p-1.5 rounded-md text-xs mb-2"
          placeholder="Ex: College Dinner"
        />
        <button
          class="cursor-pointer text-xs bg-electric-green hover:bg-electric-green/80 rounded-md py-1.5 text-cursed-black flex gap-x-1 justify-center active:translate-y-px duration-200"
          @click="createGroup"
        >
          Create New Group
        </button>
        <p class="text-xs text-red-500 mt-2" v-if="errorText">{{ errorText }}</p>
      </div>
    </div>
  </div>
</template>
