<script setup lang="ts">
import { useAuth } from '@/utils/auth';
import type { Database } from '@/utils/database.types';
import { supabase } from '@/utils/supabase';
import { ref } from 'vue';

type Group = Database['public']['Tables']['groups']['Row'];

const props = defineProps<{
  currentGroup: Group | undefined;
}>();

const emit = defineEmits(['close', 'update']);

const { user } = useAuth();

const errorText = ref<string | null>(null);
const expenseName = ref('');
const amount = ref(0);

const createExpense = async () => {
  if (!props.currentGroup) return;

  if (expenseName.value.trim().length <= 0) {
    errorText.value = 'Please enter a name for your expense.';
    return;
  }
  if (!Number.isFinite(amount.value)) {
    errorText.value = 'Please enter a valid number.';
    return;
  }

  const { error } = await supabase.from('expenses').insert({
    created_by: user.value?.id || '',
    group_id: props.currentGroup.id,
    title: expenseName.value,
    total_amount: amount.value,
  });

  if (error) {
    errorText.value = error.message;
    return;
  }

  emit('update');
  emit('close');
};
</script>

<template>
  <div class="bg-neutral-800/60 p-4 rounded-md border border-neutral-600 flex flex-col">
    <p class="text-xs mb-2">Expense Name:</p>
    <input
      type="text"
      v-model.trim.number="expenseName"
      placeholder="Morning Coffee"
      class="focus:border-electric-green/30 outline-none w-full border-neutral-700 border border-md p-3 rounded-md text-base mb-2"
    />
    <p class="text-xs mb-2">Expense Amount (RM):</p>
    <input
      type="number"
      v-model.trim="amount"
      placeholder="180"
      class="focus:border-electric-green/30 outline-none w-full border-neutral-700 border border-md p-3 rounded-md text-base mb-2"
    />
    <button
      class="cursor-pointer text-xs bg-electric-green hover:bg-electric-green/80 rounded-md py-1.5 text-cursed-black flex gap-x-1 justify-center active:translate-y-px duration-200"
      @click="createExpense"
    >
      <span class="">Create Expense</span>
    </button>
    <span class="text-rose-500 text-xs mt-2">{{ errorText }}</span>
  </div>
</template>
