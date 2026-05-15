<script setup lang="ts">
import Group from '@/components/icons/Group.vue';
import ProfileIcon from '@/components/ProfileIcon.vue';
import type { Database } from '@/utils/database.types';
import { supabase } from '@/utils/supabase';
import { computed, onMounted, ref } from 'vue';

type Group = Database['public']['Tables']['groups']['Row'];

const props = defineProps<{
  group: Group;
}>();

const names = ref<string[]>([]);
const firstTwoNames = computed(() => names.value.slice(0, 3));
const trimmedGroupName = computed(() =>
  props.group.name.length > 15 ? props.group.name.slice(0, 16) : props.group.name,
);

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

onMounted(async () => {
  // Get all the members involved with the groups that the user is inside of
  const { data: groupMembers } = await supabase
    .from('group_members')
    .select('*')
    .eq('group_id', props.group.id);

  if (!groupMembers) return;

  const memberNames = [] as string[];

  for (const m of groupMembers) {
    const { data } = await supabase.from('profiles').select('name').eq('id', m.user_id);
    memberNames.push(data?.[0]?.name || '');
  }

  names.value = memberNames;
});
</script>

<template>
  <div class="p-4 bg-neutral-800 rounded-md border border-neutral-600 relative group">
    <div class="flex items-center mb-2">
      <h3 class="text-sm uppercase font-semibold flex-1">{{ trimmedGroupName }}</h3>
      <div class="flex text-2xs min-h-6">
        <ProfileIcon
          :initial="index < 2 ? name.slice(0, 1) : `+${names.length - 2}`"
          :borderStyle="index < 2 ? 'dim' : 'none'"
          :class="{
            'translate-x-4': index === 0 && firstTwoNames.length > 1,
            'translate-x-2': index === 1 && firstTwoNames.length > 2,
            'z-10': index === 2,
          }"
          v-for="(name, index) in firstTwoNames"
        ></ProfileIcon>
      </div>
    </div>

    <div class="flex items-end">
      <div class="flex-1">
        <div class="text-xs mb-2.5">
          Created {{ dateFormatter.format(new Date(group.created_at)) }}
        </div>
        <div class="flex gap-x-2 items-center text-xs">
          <Group class="stroke-yellow-50/70 w-4 h-4"></Group>
          <span class="text-yellow-50/70"
            >{{ names.length }} member{{ firstTwoNames.length > 1 ? 's' : '' }}</span
          >
        </div>
      </div>

      <div class="text-right">
        <span class="text-yellow-50/70 text-xs">Total Expenses</span>
        <h4 class="font-semibold">RM 142.00</h4>
      </div>
    </div>

    <!-- DECORATION -->
    <div
      class="absolute -top-px -right-px size-6 border-t border-r border-electric-green rounded-tr-md group-hover:size-10 duration-200"
    ></div>
  </div>
</template>
