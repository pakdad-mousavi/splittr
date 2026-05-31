<script setup lang="ts">
// ICONS
import Plus from '@/components/icons/Plus.vue';
import Scan from '@/components/icons/Scan.vue';
import Group from '@/components/icons/Group.vue';
import Invite from '@/components/icons/Invite.vue';
import Edit from '@/components/icons/Edit.vue';
import Email from '@/components/icons/Email.vue';
import Trash from '@/components/icons/Trash.vue';
import X from '@/components/icons/X.vue';
import Repeat from '@/components/icons/Repeat.vue';

import ProfileIcon from '@/components/ProfileIcon.vue';

// UTILS
import type { Database } from '@/utils/database.types';
import { createInvite } from '@/utils/functions/sendInvite';
import { useAuth } from '@/utils/auth';
import { supabase } from '@/utils/supabase';

// VUE
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useGroupStore } from '@/stores/groups';
import { useProfileStore } from '@/stores/profiles';

// DRAWERS
import AddExpenseDrawer from './drawers/AddExpense.vue';
import SplitEquallyDrawer from './drawers/SplitEqually.vue';
import SplitManuallyDrawer from './drawers/SplitManually.vue';
import ScanReceiptDrawer from './drawers/ScanReceipt.vue';

// ------------------------------
// ------------------------------
// ------------------------------

// Refs, stores and router
const { user } = useAuth();
const groupStore = useGroupStore();
const profileStore = useProfileStore();
const router = useRouter();

type Expense = Database['public']['Tables']['expenses']['Row'];
const expenses = ref<Expense[]>([]);

// Computed values
const currentGroup = computed(() => {
  const currentGroupId = router.currentRoute.value.params.id as string | undefined;
  if (!currentGroupId) return undefined;

  return groupStore.groups.find((g) => g.id === Number(currentGroupId));
});

const groupMembers = computed(() => {
  if (!currentGroup.value) return [];

  const members = groupStore.members[currentGroup.value.id];
  if (!members) return [];

  return members.map((gm) => {
    return { ...gm, name: profileStore.profiles.get(gm.user_id) || '.' };
  });
});

const totalExpenses = computed(() => {
  if (!expenses.value) return;
  return expenses.value.reduce((acc, exp) => acc + exp.total_amount, 0);
});

// ----------------
//     DRAWERS
// ----------------
const activeDrawer = ref<'none' | 'addExpense' | 'splitEqual' | 'manual' | 'scan'>('none');
const openDrawer = (drawer: typeof activeDrawer.value) => (activeDrawer.value = drawer);
const closeDrawer = () => (activeDrawer.value = 'none');

watch(activeDrawer, (active) => {
  if (active !== 'none') {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'scroll';
  }
});

const drawerInfo = computed(() => {
  switch (activeDrawer.value) {
    case 'addExpense':
      return {
        title: 'Add Expense',
        description: 'Add a new cost to the group.',
      };
    case 'splitEqual':
      return {
        title: 'Split Expenses Equally',
        description: 'Spread the cost among all group members.',
      };
    case 'manual':
      return {
        title: 'Split Expenses Manually',
        description: "Full control over each member's contribution.",
      };
    case 'scan':
      return {
        title: 'Scan Receipt',
        description: 'Scan a receipt to get started.',
      };
    default:
      return null;
  }
});

const drawerComponent = computed(() => {
  switch (activeDrawer.value) {
    case 'addExpense':
      return AddExpenseDrawer;
    case 'splitEqual':
      return SplitEquallyDrawer;
    case 'manual':
      return SplitManuallyDrawer;
    case 'scan':
      return ScanReceiptDrawer;
    default:
      return null;
  }
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
    await createInvite({ group_id: currentGroup.value.id, email: email.value });
    emailSuccessText.value = 'Invite sent successfully!';
    emailErrorText.value = null;
    email.value = '';
  } catch (err) {
    console.log(err);
  }
};

const clearAllMemberDebts = async () => {
  for (const member of groupMembers.value) {
    const { error } = await supabase
      .from('group_members')
      .update({ pending_amount: 0 })
      .eq('id', member.id);

    if (error) {
      console.log(error);
      return;
    }
  }

  for (const expense of expenses.value) {
    const { error } = await supabase
      .from('expenses')
      .update({ is_split: false })
      .eq('id', expense.id);

    if (error) {
      console.log(error);
      return;
    }
  }

  await updateExpenses();
  await groupStore.updateMembers();
};

// TO BE IMPLEMENTED
const groupName = ref('');
const updateGroupName = () => {};

const deleteGroup = () => {};

// ---------------
//     HELPERS
// ---------------

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currencyDisplay: 'narrowSymbol',
  currency: 'MYR',
});

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  year: '2-digit',
  month: '2-digit',
  day: '2-digit',
});

// ----------------------
//    EXPENSE FETCHING
// ----------------------
const updateExpenses = async () => {
  // Initialize if not initialized yet
  await groupStore.init();

  // Force update members
  await groupStore.updateMembers();

  groupName.value = currentGroup.value!.name;

  // Get expenses from db
  const expensesRes = await supabase
    .from('expenses')
    .select('*')
    .eq('group_id', currentGroup.value!.id)
    .order('created_by', { ascending: true });

  if (expensesRes.error) return;
  expenses.value = expensesRes.data.reverse();
};

onMounted(async () => {
  await updateExpenses();
});
</script>

<template>
  <div class="overflow-hidden max-w-lg relative">
    <div v-if="currentGroup" class="p-4">
      <!-- GROUP DETAILS -->
      <div class="p-4 bg-neutral-800 border border-neutral-600 flex flex-col rounded-md mb-4">
        <div class="flex mb-4">
          <h3 class="text-xl font-semibold mb-1 flex-1">
            {{ currentGroup.name }}
          </h3>
          <div class="flex gap-x-2">
            <a href="#invite" class="cursor-pointer">
              <Invite class="stroke-electric-green size-5"></Invite>
            </a>
            <a href="#edit" class="cursor-pointer">
              <Edit class="stroke-electric-green size-5"></Edit>
            </a>
          </div>
        </div>

        <div class="flex items-center gap-x-2">
          <button
            class="cursor-pointer active:translate-y-px duration-200 flex bg-electric-green py-2 rounded-md text-cursed-black items-center text-xs gap-x-2 w-3/4 justify-center"
            @click="openDrawer('addExpense')"
          >
            <Plus class="stroke-cursed-black size-4"></Plus>
            <span>Add Expense</span>
          </button>
          <button
            class="cursor-pointer active:translate-y-px duration-200 flex border border-electric-green py-2 rounded-md items-center gap-x-2 w-1/4 justify-center"
            @click="openDrawer('scan')"
          >
            <Scan class="stroke-electric-green size-4"></Scan>
          </button>
        </div>

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
                :class="{ 'order-first': member.user_id === currentGroup.created_by }"
                :borderStyle="member.user_id === currentGroup.created_by ? 'on' : 'dim'"
                :initial="member.name.slice(0, 1)"
                v-for="member in groupMembers"
              ></ProfileIcon>
            </div>
          </div>
          <span class="font-montserrat text-yellow-50/60 text-xs"
            >{{ groupMembers.length }} total</span
          >
        </div>

        <!-- ACTION CENTER -->
        <div
          class="my-6 bg-linear-to-r from-transparent via-neutral-500 h-0.5 w-full"
          v-if="user?.id === currentGroup.created_by"
        ></div>
        <div v-if="user?.id === currentGroup.created_by">
          <p class="text-sm mb-2">Split Expenses:</p>
          <div class="flex gap-x-2 mb-2">
            <button
              class="cursor-pointer active:translate-y-px duration-200 flex border border-electric-green py-2 rounded-md items-center gap-x-2 justify-center w-full"
              @click="openDrawer('splitEqual')"
            >
              <span class="text-xs text-electric-green">Equally</span>
            </button>
            <button
              class="cursor-pointer active:translate-y-px duration-200 flex border border-electric-green py-2 rounded-md items-center gap-x-2 justify-center w-full"
              @click="openDrawer('manual')"
            >
              <span class="text-xs text-electric-green">Manually</span>
            </button>
          </div>
          <button
            class="cursor-pointer active:translate-y-px duration-200 flex border border-amber-500 py-2 rounded-md items-center gap-x-2 justify-center w-full"
            @click="clearAllMemberDebts"
          >
            <Repeat class="size-4 stroke-amber-500"></Repeat>
            <span class="text-xs text-amber-500">Reset All Expense Splits</span>
          </button>
        </div>
      </div>

      <!-- DEBT PER MEMBER -->
      <div class="mb-8">
        <h4 class="font-playfair mb-2">Remaining Debt Per Member:</h4>
        <div class="flex flex-col gap-y-4">
          <div
            class="border border-neutral-600 bg-neutral-800 p-4 rounded-md"
            v-for="member in groupMembers"
          >
            <div class="text-sm flex">
              <div class="flex-1 flex flex-col">
                <span class="font-medium">{{ member.name }}</span>
                <span class="text-yellow-50/60 text-xs">
                  Last updated at {{ dateFormatter.format(new Date(member.updated_at)) }}
                </span>
              </div>
              <div class="flex flex-col items-end">
                <span>{{ currencyFormatter.format(member.pending_amount) }}</span>
                <span
                  class="text-xs"
                  :class="member.pending_amount === 0 ? 'text-electric-green' : 'text-rose-500'"
                >
                  {{ member.pending_amount === 0 ? 'Settled' : 'Pending' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- EXPENSE FEED -->
      <div class="mb-8">
        <div class="flex items-end mb-2">
          <h4 class="font-playfair flex-1">Expense Feed:</h4>
          <span class="text-electric-green text-sm"
            >Total: {{ currencyFormatter.format(totalExpenses || 0) }}</span
          >
        </div>
        <div class="flex flex-col gap-4">
          <div
            class="flex flex-col p-4 bg-neutral-800 border-neutral-600 border rounded-md"
            v-for="expense in expenses"
          >
            <div class="flex text-sm gap-x-2">
              <div class="flex-1">
                <h4 class="font-medium">
                  {{
                    expense.title.length > 18 ? expense.title.slice(0, 19) + '...' : expense.title
                  }}
                </h4>
              </div>
              <span class="text-electric-green">{{
                currencyFormatter.format(expense.total_amount)
              }}</span>
            </div>
            <div class="text-xs mt-1 flex w-full items-center text-yellow-50/60">
              <span class="flex-1">
                Created by {{ profileStore.profiles.get(expense.created_by)?.split(' ')[0] }}
              </span>
              <span>
                {{ dateFormatter.format(new Date(expense.created_at)) }}
              </span>
            </div>

            <div
              v-if="expense.created_by === user?.id || currentGroup.created_by === user?.id"
              class="mt-2 flex gap-x-2"
            >
              <button class="p-1 bg-electric-green/10 border-electric-green border rounded-md">
                <Edit class="stroke-electric-green size-3"></Edit>
              </button>
              <button class="p-1 bg-rose-500/10 border-rose-500 border rounded-md">
                <Trash class="stroke-rose-500 size-3"></Trash>
              </button>
            </div>
          </div>
        </div>
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
            class="focus:border-electric-green/30 outline-none w-full border-neutral-700 border border-md p-3 rounded-md text-base mb-2"
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
        <h4 class="font-playfair mb-2">Edit Group:</h4>
        <div class="flex flex-col p-4 bg-neutral-800 border-neutral-600 border rounded-md">
          <p class="text-xs mb-2">Group Name:</p>
          <input
            type="text"
            v-model.trim="groupName"
            :placeholder="currentGroup.name"
            class="focus:border-electric-green/30 outline-none w-full border-neutral-700 border border-md p-3 rounded-md text-base mb-2"
          />
          <button
            class="cursor-pointer text-xs bg-electric-green hover:bg-electric-green/80 rounded-md py-1.5 text-cursed-black flex gap-x-1 justify-center active:translate-y-px duration-200"
            @click="updateGroupName"
          >
            <span class="">Update Group Name</span>
          </button>
          <button
            class="cursor-pointer active:translate-y-px duration-200 flex border border-rose-500 py-2 rounded-md text-rose-500 items-center text-xs gap-x-2 w-full justify-center mt-2"
            @click="deleteGroup"
          >
            <Trash class="stroke-rose-500 stroke-1 size-4"></Trash>
            <span>Delete Group</span>
          </button>
        </div>
      </div>
    </div>
    <div v-else class="p-4 flex flex-col items-center justify-center text-center">
      <h2 class="text-lg font-semibold text-neutral-400">Group Not Found</h2>
      <p class="text-sm text-neutral-500 mt-2">The group you're looking for doesn't exist.</p>
    </div>

    <!-- DRAWERS -->
    <Transition name="slide-up">
      <div
        class="bg-neutral-950/80 backdrop-blur-lg absolute top-0 left-1/2 -translate-x-1/2 h-[calc(100vh-128px)] w-full p-4 overflow-y-scroll max-w-lg"
        v-if="activeDrawer !== 'none'"
      >
        <div class="flex w-full gap-x-2 items-center mb-4">
          <div class="flex-1">
            <h2 class="font-playfair text-lg">{{ drawerInfo?.title }}</h2>
            <p class="text-xs">{{ drawerInfo?.description }}</p>
          </div>
          <button
            class="rounded-full bg-neutral-800 border border-electric-green size-8 flex items-center justify-center hover:bg-electric-green duration-200 group cursor-pointer"
            @click="closeDrawer"
          >
            <X
              class="stroke-electric-green size-4.5 duration-200 group-hover:stroke-cursed-black"
            ></X>
          </button>
        </div>
        <Transition name="slide-up">
          <component
            :is="drawerComponent"
            @close="closeDrawer"
            @update="updateExpenses"
            :currentGroup="currentGroup"
            :expenses="expenses"
            :totalExpenses="totalExpenses"
          />
        </Transition>
      </div>
    </Transition>
  </div>
</template>

<!-- USE VUE STYLE TAG TO DEFINE ANIMATION -->
<style>
/* 1. Define the starting and ending state for the entering/leaving */
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateX(-100%);
}

/* 2. Define the transition timing and properties */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.7s cubic-bezier(0.37, 0, 0.62, 0.99);
}

/* 3. The 'to' state for enter and 'from' state for leave (default) */
.slide-up-enter-to,
.slide-up-leave-from {
  transform: translateX(0);
}
</style>
