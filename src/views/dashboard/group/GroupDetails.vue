<script setup lang="ts">
// ICONS
import Copy from '@/components/icons/Copy.vue';
import Plus from '@/components/icons/Plus.vue';
import Scan from '@/components/icons/Scan.vue';
import Group from '@/components/icons/Group.vue';
import Trash from '@/components/icons/Trash.vue';

// OTHER
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import ProfileIcon from '@/components/ProfileIcon.vue';
import { useGroupStore } from '@/stores/groups';
import { useProfileStore } from '@/stores/profiles';

const groupStore = useGroupStore();
const profileStore = useProfileStore();
const router = useRouter();

const currentGroup = computed(() => {
  const currentGroupId = router.currentRoute.value.params.id as string | undefined;
  if (!currentGroupId) return undefined;

  return groupStore.groups.find((g) => g.id === Number(currentGroupId));
});

const groupMemberNames = computed(() => {
  if (!currentGroup.value) return [];

  const members = groupStore.members[currentGroup.value.id];
  if (!members) return [];

  return members.map((gm) => {
    return { id: gm.user_id, name: profileStore.profiles.get(gm.user_id) || '.' };
  });
});

const copyInviteLink = () => {};
const deleteGroup = () => {};
const scanReceipt = () => {};
const addExpense = () => {};
</script>

<template>
  <div v-if="currentGroup" class="p-4">
    <!-- GROUP DETAILS -->
    <div class="p-4 bg-neutral-800 border border-neutral-600 flex flex-col rounded-md mb-4">
      <div class="mb-4">
        <h3 class="text-xl font-semibold mb-1">
          {{ currentGroup.name }}
        </h3>
        <button class="cursor-pointer flex items-center gap-x-2" @click="copyInviteLink">
          <span class="bg-cursed-black px-1 text-xs font-semibold text-yellow-50/60"
            >CODE: {{ currentGroup.invite_code }}</span
          >
          <Copy class="fill-electric-green size-4"></Copy>
        </button>
      </div>

      <div class="flex items-center gap-x-2">
        <button
          class="cursor-pointer active:translate-y-px duration-200 flex bg-electric-green py-2 rounded-md text-cursed-black items-center text-xs font-semibold gap-x-2 w-3/4 justify-center"
          @click="addExpense"
        >
          <Plus class="stroke-cursed-black stroke-2 size-4"></Plus>
          <span>Add Expense</span>
        </button>
        <button
          class="cursor-pointer active:translate-y-px duration-200 flex border border-electric-green py-2 rounded-md text-cursed-black items-center text-xs font-semibold gap-x-2 w-1/4 justify-center"
          @click="scanReceipt"
        >
          <Scan class="stroke-electric-green stroke-2 size-4"></Scan>
        </button>
      </div>

      <!-- <button
        class="cursor-pointer active:translate-y-px duration-200 flex border border-rose-500 py-2 rounded-md text-rose-500 items-center text-xs font-semibold gap-x-2 w-full justify-center"
        @click="deleteGroup"
      >
        <Trash class="stroke-rose-500 size-4"></Trash>
        <span>Delete Group</span>
      </button> -->

      <!-- MEMBERS -->
      <div class="mt-4">
        <div class="flex gap-x-4">
          <div class="flex gap-x-2 items-center">
            <Group class="stroke-yellow-50 size-4"></Group>
            <h4 class="font-playfair">Members:</h4>
          </div>
          <div class="flex overflow-x-scroll gap-x-1 min-h-6">
            <ProfileIcon
              class="min-w-6"
              :class="{ 'order-first': member.id === currentGroup.created_by }"
              :borderStyle="member.id === currentGroup.created_by ? 'on' : 'dim'"
              :initial="member.name.slice(0, 1)"
              v-for="member in groupMemberNames"
            ></ProfileIcon>
          </div>
        </div>
        <span class="font-montserrat text-yellow-50/60 text-xs"
          >{{ groupMemberNames.length }} total</span
        >
      </div>
    </div>

    <!-- CURRENT SETTLEMENTS -->
    <div class="mb-4">
      <h4 class="font-playfair">Current Settlements:</h4>
    </div>

    <!-- EXPENSE FEED -->
    <div class="mb-4">
      <h4 class="font-playfair">Expense Feed:</h4>
    </div>
  </div>
  <div v-else class="p-4 flex flex-col items-center justify-center text-center">
    <h2 class="text-lg font-semibold text-neutral-400">Group Not Found</h2>
    <p class="text-sm text-neutral-500 mt-2">The group you're looking for doesn't exist.</p>
  </div>
</template>
