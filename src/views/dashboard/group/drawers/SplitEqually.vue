<script setup lang="ts">
import { useGroupStore } from '@/stores/groups';
import { useProfileStore } from '@/stores/profiles';
import { useAuth } from '@/utils/auth';
import type { Database } from '@/utils/database.types';
import { supabase } from '@/utils/supabase';
import { computed, ref } from 'vue';

type Group = Database['public']['Tables']['groups']['Row'];
type Expense = Database['public']['Tables']['expenses']['Row'];

const props = defineProps<{
  currentGroup: Group | undefined;
  expenses: Expense[];
  totalExpenses: number | undefined;
}>();

const emit = defineEmits(['close']);

const groupStore = useGroupStore();
const profileStore = useProfileStore();

const groupMembers = computed(() => {
  if (!props.currentGroup) return;
  return groupStore.members[props.currentGroup.id];
});

const unsettledExpenses = computed(() => {
  return props.expenses.filter((e) => !e.is_split);
});

const totalUnsettledExpenses = computed(() => {
  return unsettledExpenses.value.reduce((acc, exp) => acc + exp.total_amount, 0);
});

const amountPerMember = computed(() => {
  const expenses = totalUnsettledExpenses.value || null;
  const totalMembers = groupMembers.value?.length || null;

  if (expenses === null || totalMembers === null || expenses === 0) return 0;
  return Number((expenses / totalMembers).toFixed(2));
});

const splitEqually = async () => {
  if (!groupMembers.value) return;

  // Update pending amount for group members
  for (const member of groupMembers.value) {
    const { error } = await supabase
      .from('group_members')
      .update({ pending_amount: member.pending_amount + amountPerMember.value })
      .eq('id', member.id);

    if (error) {
      console.log(error);
      return;
    }
  }

  // Update expense statuses
  for (const exp of unsettledExpenses.value) {
    const { error } = await supabase.from('expenses').update({ is_split: true }).eq('id', exp.id);
    if (error) {
      console.log(error);
      return;
    }
  }

  emit('close');
};

// HELPERS
const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currencyDisplay: 'narrowSymbol',
  currency: 'MYR',
});

const getProfile = (id: string | undefined) => {
  return profileStore.profiles.get(id || '');
};
</script>

<template>
  <div class="bg-neutral-800/60 p-4 rounded-md border border-neutral-600 flex flex-col">
    <div class="flex flex-col" v-if="amountPerMember !== 0">
      <p class="font-playfair text-lg mb-2 text-electric-green">
        Total in Expenses: {{ currencyFormatter.format(totalUnsettledExpenses || 0) }}
      </p>
      <table class="text-sm w-full border border-neutral-600 text-left mb-2">
        <thead>
          <th class="bg-neutral-600/50 p-2">Member Name</th>
          <th class="bg-neutral-600/50 p-2">Amount</th>
        </thead>

        <tbody>
          <tr class="even:bg-neutral-600/20" v-for="member in groupMembers">
            <td class="p-2">{{ getProfile(member.user_id) }}</td>
            <td class="p-2">{{ currencyFormatter.format(amountPerMember) }}</td>
          </tr>
        </tbody>
      </table>
      <button
        class="cursor-pointer active:translate-y-px duration-200 flex bg-electric-green py-2 rounded-md text-cursed-black items-center text-xs gap-x-2 justify-center w-full"
        @click="splitEqually"
      >
        <span>Confirm Expense Split</span>
      </button>
    </div>
    <div v-else class="text-center">
      <h2 class="text-lg font-semibold text-neutral-400">All Expenses Have Been Split</h2>
      <p class="text-sm text-neutral-500 mt-2">
        No expenses remain left to split. Add some expenses, or clear the current settlements and
        try again.
      </p>
    </div>
  </div>
</template>
