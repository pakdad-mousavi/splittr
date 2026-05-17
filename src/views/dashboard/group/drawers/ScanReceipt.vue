<script setup lang="ts">
import { useGroupStore } from '@/stores/groups';
import { useProfileStore } from '@/stores/profiles';
import { useAuth } from '@/utils/auth';
import type { Database } from '@/utils/database.types';
import { analyzeReceipt } from '@/utils/functions/analyzeReceipt';
import { supabase } from '@/utils/supabase';
import { computed, onMounted, ref, watchEffect } from 'vue';

import { Capacitor } from '@capacitor/core';
import { Filesystem } from '@capacitor/filesystem';
import { Camera } from '@capacitor/camera';

type Group = Database['public']['Tables']['groups']['Row'];
type GroupMember = Database['public']['Tables']['group_members']['Row'];

const props = defineProps<{
  currentGroup: Group | undefined;
}>();

const { user } = useAuth();
const groupStore = useGroupStore();
const profileStore = useProfileStore();
const isNative = ref(false);

onMounted(() => {
  const platform = Capacitor.getPlatform();
  isNative.value = platform !== 'web';
});

const groupMembers = computed(() => {
  if (!props.currentGroup) return;
  return groupStore.members[props.currentGroup.id];
});

const emit = defineEmits(['close', 'update']);

const base64Image = ref<string | null>(null);
const imageType = ref<string | null>(null);

const handleFileUpload = async (event?: Event) => {
  if (isNative.value) {
    const { uri, webPath } = await Camera.takePhoto({
      quality: 90,
      includeMetadata: false,
    });

    // Use Filesystem to read the file into base64 directly
    const { data } = await Filesystem.readFile({
      path: uri || '',
    });

    // data is already a base64 string on native
    base64Image.value = `data:image/jpeg;base64,${data}`;
    imageType.value = 'jpeg';
  } else {
    if (!event) return;
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      base64Image.value = reader.result as string;
      imageType.value = base64Image.value?.split(';')?.[0]?.split('/')[1] || '';
    };
    reader.onerror = (error) => console.error('Error converting file:', error);
    reader.readAsDataURL(file);
  }
};

const receiptItems = ref<Record<string, number>>({});
const analyzed = ref(false);

const errorText = ref<string | null>(null);
const analyze = async () => {
  if (!base64Image.value || !imageType.value) {
    errorText.value = 'No image found or unsupported type. Please try again.';
    return;
  }

  try {
    const data = await analyzeReceipt({ image: base64Image.value });

    if (!data?.items || Object.keys(data.items).length <= 0) {
      errorText.value = 'Failed to analyze image. Please try again later.';
      return;
    }

    receiptItems.value = data.items;
    analyzed.value = true;
  } catch (e) {
    errorText.value = 'Failed to analyze image. Please try again later.';
    return;
  }
};

const expenseName = ref('');
const splitErrText = ref<string | null>(null);
const receiptSplit = ref<GroupMember[]>([]);

const splitReceipt = async () => {
  if (expenseName.value.trim().length <= 0) {
    splitErrText.value = 'Please enter a name for this expense.';
    return;
  }
  splitErrText.value = null;

  for (let i = 0; i < receiptSplit.value.length; i++) {
    const member = receiptSplit.value[i]!;
    const receiptItemPrice = Object.values(receiptItems.value)[i]!;
    const { error } = await supabase
      .from('group_members')
      .update({
        pending_amount: member.pending_amount + receiptItemPrice,
      })
      .eq('id', member.id);

    member.pending_amount += receiptItemPrice;

    if (error) {
      splitErrText.value = error.message;
      return;
    }
  }

  const subTotal = Object.values(receiptItems.value).reduce((acc, exp) => acc + exp, 0);
  const { error } = await supabase.from('expenses').insert({
    created_by: user.value?.id || '',
    group_id: props.currentGroup!.id,
    title: expenseName.value,
    total_amount: subTotal,
    is_split: true,
  });

  if (error) {
    splitErrText.value = error.message;
    return;
  }

  emit('update');
  emit('close');
};

watchEffect(() => {
  receiptSplit.value = new Array(Object.keys(receiptItems.value).length).fill(
    groupMembers.value?.[0],
  );
});

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
  <div>
    <div v-if="!analyzed">
      {{ base64Image }}
      <label
        class="w-full h-40 border border-neutral-600 bg-neutral-800 rounded-md flex items-center justify-center text-center cursor-pointer font-playfair text-lg mb-4"
        @click="isNative ? handleFileUpload() : ''"
      >
        <input
          type="file"
          accept="image/*"
          capture="environment"
          @change="handleFileUpload"
          class="hidden"
          v-if="!isNative"
        />
        <span v-if="!base64Image || !imageType">Upload Receipt</span>
        <span v-else>Image Received</span>
      </label>
      <button
        class="cursor-pointer active:translate-y-px duration-200 flex bg-electric-green py-2 rounded-md text-cursed-black items-center text-xs gap-x-2 w-full justify-center"
        @click="analyze"
      >
        <span>Analyze Receipt</span>
      </button>
      <span class="mt-2 text-rose-500 text-xs block" v-if="errorText">{{ errorText }}</span>
    </div>
    <div v-else>
      <table class="text-sm w-full border border-neutral-600 text-left mb-4">
        <thead>
          <th class="bg-neutral-600/50 p-2">Item Name</th>
          <th class="bg-neutral-600/50 p-2">Amount</th>
        </thead>

        <tbody>
          <tr class="even:bg-neutral-600/20" v-for="[item, price] in Object.entries(receiptItems)">
            <td class="p-2">{{ item }}</td>
            <td class="p-2">{{ currencyFormatter.format(price) }}</td>
          </tr>
        </tbody>
      </table>

      <h4 class="font-playfair">1. Expense Name:</h4>
      <p class="mb-4 text-xs">Please choose a name for this expense.</p>
      <input
        type="text"
        v-model.trim="expenseName"
        placeholder="Breakfast"
        class="focus:border-electric-green/30 outline-none w-full border-neutral-700 border border-md p-3 rounded-md text-base mb-4"
      />

      <h4 class="font-playfair">2. Choose Member:</h4>
      <p class="mb-6 text-xs">Please tell us which member ordered what item.</p>
      <div class="flex flex-col mb-4 space-y-4">
        <div v-for="([item, price], index) in Object.entries(receiptItems)" class="flex flex-col">
          <div class="flex text-sm mb-1">
            <h4 class="flex-1">{{ item }}</h4>
            <span class="text-electric-green">{{ currencyFormatter.format(price) }}</span>
          </div>
          <select
            class="bg-neutral-800 p-2 rounded-md border border-neutral-600"
            v-model="receiptSplit[index]"
          >
            <option :value="member" :key="member.id" v-for="member in groupMembers">
              {{ getProfile(member.user_id) }}
            </option>
          </select>
        </div>
      </div>
      <button
        class="cursor-pointer active:translate-y-px duration-200 flex bg-electric-green py-2 rounded-md text-cursed-black items-center text-xs gap-x-2 w-full justify-center"
        @click="splitReceipt"
      >
        <span>Split Receipt</span>
      </button>
      <span class="mt-2 text-rose-500 text-xs block" v-if="splitErrText">{{ splitErrText }}</span>
    </div>
  </div>
</template>
