<script setup lang="ts">
const props = defineProps<{
  initial: string;
  borderStyle: 'on' | 'dim' | 'none';
}>();

const getBorderStyle = () => {
  switch (props.borderStyle) {
    case 'on':
      return 'border border-electric-green';
    case 'dim':
      return 'border border-electric-green/30';
    case 'none':
    default:
      return '';
  }
};
</script>

<template>
  <div
    class="rounded-full w-6 h-6 bg-cursed-black flex items-center justify-center"
    :class="getBorderStyle()"
  >
    {{ initial }}
  </div>
</template>
