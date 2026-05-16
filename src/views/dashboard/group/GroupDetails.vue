<script setup lang="ts">
// ICONS
import Plus from '@/components/icons/Plus.vue';
import Scan from '@/components/icons/Scan.vue';
import Group from '@/components/icons/Group.vue';
import Trash from '@/components/icons/Trash.vue';

// OTHER
import { computed, onBeforeMount, ref } from 'vue';
import { useRouter } from 'vue-router';
import ProfileIcon from '@/components/ProfileIcon.vue';
import { useGroupStore } from '@/stores/groups';
import { useProfileStore } from '@/stores/profiles';
import Invite from '@/components/icons/Invite.vue';
import Edit from '@/components/icons/Edit.vue';
import Email from '@/components/icons/Email.vue';
import { supabase } from '@/utils/supabase';
import { createInvite } from '@/utils/functions/sendInvite';

// ------------------------------
// ------------------------------
// ------------------------------

// Stores and router
const groupStore = useGroupStore();
const profileStore = useProfileStore();
const router = useRouter();

// Computed values
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

// ----------------
//     FEATURES
// ----------------

// Invite by email
const email = ref('');
const emailErrorText = ref<string | null>(null);
const emailSuccessText = ref<string | null>(null);

const inviteByEmail = async () => {
  if (!currentGroup.value) return;

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return;

  if (email.value.trim().length <= 0) {
    emailErrorText.value = "Please enter the invitee's email";
    emailSuccessText.value = null;
    return;
  }

  try {
    await createInvite({ group_id: currentGroup.value.id, email: session.user.email! });
    emailSuccessText.value = 'Invite sent successfully!';
    emailErrorText.value = null;
    email.value = '';
  } catch (err) {
    console.log(err);
  }
};

const scanReceipt = () => {};
const addExpense = () => {};
const deleteGroup = () => {};

// Update group members before mounting component in case someone accepts an invite or leaves the group
onBeforeMount(async () => {
  await groupStore.updateMembers();
});
</script>

<template>
  <div v-if="currentGroup" class="p-4">
    <!-- GROUP DETAILS -->
    <div class="p-4 bg-neutral-800 border border-neutral-600 flex flex-col rounded-md mb-4">
      <div class="flex mb-4">
        <h3 class="text-xl font-semibold mb-1 flex-1">
          {{ currentGroup.name }}
        </h3>
        <div class="flex gap-x-2">
          <button class="cursor-pointer" @click="$router.push(`/groups/${currentGroup.id}#invite`)">
            <Invite class="stroke-electric-green size-5"></Invite>
          </button>
          <button class="cursor-pointer" @click="$router.push(`/groups/${currentGroup.id}#edit`)">
            <Edit class="stroke-electric-green size-5"></Edit>
          </button>
        </div>
      </div>

      <div class="flex items-center gap-x-2">
        <button
          class="cursor-pointer active:translate-y-px duration-200 flex bg-electric-green py-2 rounded-md text-cursed-black items-center text-xs gap-x-2 w-3/4 justify-center"
          @click="addExpense"
        >
          <Plus class="stroke-cursed-black size-4"></Plus>
          <span>Add Expense</span>
        </button>
        <button
          class="cursor-pointer active:translate-y-px duration-200 flex border border-electric-green py-2 rounded-md items-center gap-x-2 w-1/4 justify-center"
          @click="scanReceipt"
        >
          <Scan class="stroke-electric-green size-4"></Scan>
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
    <div class="mb-8">
      <h4 class="font-playfair">Current Settlements:</h4>
    </div>

    <!-- EXPENSE FEED -->
    <div class="mb-8">
      <h4 class="font-playfair">Expense Feed:</h4>
    </div>

    <!-- INVITE MEMBERS -->
    <div class="mb-8" id="invite">
      <h4 class="font-playfair mb-2">Invite By Email:</h4>
      <div class="flex flex-col p-4 bg-neutral-800 border-neutral-600 border rounded-md">
        <p class="text-xs mb-2">Email Address:</p>
        <input
          type="email"
          v-model.trim="email"
          placeholder="john.doe@example.com"
          class="focus:border-electric-green/30 outline-none w-full border-neutral-700 border border-md p-1.5 rounded-md text-xs mb-2"
        />
        <button
          class="cursor-pointer text-xs bg-electric-green hover:bg-electric-green/80 rounded-md py-1.5 text-cursed-black flex gap-x-1 justify-center active:translate-y-px duration-200"
          @click="inviteByEmail"
        >
          <Email class="stroke-cursed-black w-4 h-4 stroke-1!"></Email>
          <span class="">Invite with Email</span>
        </button>
        <p class="text-rose-500 text-xs mt-2" v-if="emailErrorText">{{ emailErrorText }}</p>
        <p class="text-electric-green text-xs mt-2" v-if="emailSuccessText">
          {{ emailSuccessText }}
        </p>
      </div>
    </div>

    <!-- EDIT GROUP -->
    <div class="mb-8" id="edit">
      <h4 class="font-playfair">Edit Group:</h4>
    </div>
  </div>
  <div v-else class="p-4 flex flex-col items-center justify-center text-center">
    <h2 class="text-lg font-semibold text-neutral-400">Group Not Found</h2>
    <p class="text-sm text-neutral-500 mt-2">The group you're looking for doesn't exist.</p>
  </div>
</template>
