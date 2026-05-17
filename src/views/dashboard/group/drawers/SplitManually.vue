<script setup lang="ts">
import { useGroupStore } from '@/stores/groups';
import { useProfileStore } from '@/stores/profiles';
import type { Database } from '@/utils/database.types';
import { supabase } from '@/utils/supabase';
import { computed, ref, watchEffect } from 'vue';

type Group = Database['public']['Tables']['groups']['Row'];
type Expense = Database['public']['Tables']['expenses']['Row'];

const props = defineProps<{
  currentGroup: Group | undefined;
  expenses: Expense[];
  totalExpenses: number | undefined;
}>();

const emit = defineEmits(['close', 'update']);

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

const manualSplit = ref<number[]>([]);
const totalManualSplit = computed(() =>
  manualSplit.value.reduce((acc, exp) => (Number.isFinite(exp) ? acc + exp : acc), 0),
);

const errorText = ref<string | null>(null);
const splitManually = async () => {
  if (totalManualSplit.value.toFixed(2) !== totalUnsettledExpenses.value.toFixed(2)) {
    errorText.value =
      'Please ensure that the total of your manual split is equal to the total unsettled expenses.';
    return;
  }

  errorText.value = null;
  if (!groupMembers.value) return;

  // Update pending amount for group members
  for (let i = 0; i < groupMembers.value.length; i++) {
    const member = groupMembers.value[i]!;
    const { error } = await supabase
      .from('group_members')
      .update({
        pending_amount: member.pending_amount + (manualSplit.value[i]! || 0),
        updated_at: new Date().toISOString(),
      })
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

  emit('update');
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

watchEffect(() => {
  manualSplit.value = new Array(groupMembers.value?.length).fill(0);
});
</script>

<template>
  <div v-if="totalUnsettledExpenses > 0">
    <h4 class="mb-2">
      Remaining:
      <span
        class="text-electric-green"
        :class="{
          'text-amber-500!': totalManualSplit.toFixed(2) < totalUnsettledExpenses.toFixed(2),
          'text-rose-500': totalManualSplit.toFixed(2) > totalUnsettledExpenses.toFixed(2),
        }"
      >
        {{ currencyFormatter.format(totalUnsettledExpenses - totalManualSplit) }}
      </span>
    </h4>
    <div
      class="mb-4 w-full h-6 border-electric-green border rounded-md overflow-hidden duration-200"
      :class="{
        'border-amber-500!': totalManualSplit.toFixed(2) < totalUnsettledExpenses.toFixed(2),
        'border-rose-500': totalManualSplit.toFixed(2) > totalUnsettledExpenses.toFixed(2),
      }"
    >
      <div
        class="h-full bg-electric-green/50 duration-200"
        :style="`width: ${(totalManualSplit / totalUnsettledExpenses) * 100}%`"
        :class="{
          'bg-amber-500/50!': totalManualSplit.toFixed(2) < totalUnsettledExpenses.toFixed(2),
          'bg-rose-500/50': totalManualSplit.toFixed(2) > totalUnsettledExpenses.toFixed(2),
        }"
      ></div>
    </div>
    <div class="space-y-4">
      <div class="" v-for="(member, index) in groupMembers">
        <h4 class="text-sm mb-2">{{ getProfile(member.user_id) }}:</h4>
        <div class="flex">
          <input
            type="number"
            v-model.trim.number="manualSplit[index]"
            placeholder="RM..."
            class="focus:border-electric-green/30 outline-none w-full border-neutral-700 border border-md p-3 rounded-md text-base mb-2"
          />
        </div>
      </div>
    </div>
    <button
      class="cursor-pointer text-xs bg-electric-green hover:bg-electric-green/80 rounded-md py-1.5 text-cursed-black flex gap-x-1 justify-center active:translate-y-px duration-200 w-full"
      @click="splitManually"
    >
      <span>Confirm Manual Split</span>
    </button>
    <p class="text-xs text-rose-500 mt-2" v-if="errorText">{{ errorText }}</p>
  </div>
  <div v-else class="text-center">
    <h2 class="text-lg font-semibold text-neutral-400">All Expenses Have Been Split</h2>
    <p class="text-sm text-neutral-500 mt-2">
      No expenses remain left to split. Add some expenses, or clear the current settlements and try
      again.
    </p>
  </div>
</template>
