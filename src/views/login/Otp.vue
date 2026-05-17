<script setup lang="ts">
import Arrow from '@/components/icons/Arrow.vue';
import { supabase } from '@/utils/supabase';
import { onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const NUMBERS = '0123456789';
const OTP_COOLDOWN = 5;

const inputs = ref<HTMLElement[]>([]);
const otp = ref<string[]>(['', '', '', '', '', '']);

const timeLeft = ref(OTP_COOLDOWN);
const intervalId = ref<number | null>(null);
const errorText = ref<string | null>(null);

const router = useRouter();
const email = (router.currentRoute.value.query.email as string) || '';

const onInput = (index: number, event: Event) => {
  const target = event.target as HTMLInputElement;
  let value = target.value.replace(/[^0-9]/g, ''); // Only allow digits
  if (value.length > 1) {
    value = value.slice(-1); // Take the last digit if multiple
  }
  otp.value[index] = value;
  target.value = value; // Ensure the input reflects the value
  if (value && index < 5) {
    inputs.value[index + 1]?.focus();
  }
};

const onKeydown = (index: number, e: KeyboardEvent) => {
  if (e.key === 'Backspace') {
    if (!otp.value[index]) {
      // If current is empty, move to previous
      if (index > 0) {
        inputs.value[index - 1]?.focus();
      }
    } else {
      // Clear current
      otp.value[index] = '';
    }
  } else if (!NUMBERS.includes(e.key)) {
    e.preventDefault();
  }
};

const resendOtp = async () => {
  await supabase.auth.signInWithOtp({ email });
  startOtpCooldown();
};

const verifyOtp = async () => {
  const code = otp.value.join('');

  const { error } = await supabase.auth.verifyOtp({
    email,
    token: code,
    type: 'email',
  });

  if (error) {
    errorText.value = error.message;
    return;
  }

  router.push('/');
};

const startOtpCooldown = () => {
  timeLeft.value = OTP_COOLDOWN;
  intervalId.value = window.setInterval(() => {
    timeLeft.value--;

    if (timeLeft.value === 0) {
      stopOtpCooldown();
    }
  }, 1000);
};

const stopOtpCooldown = () => {
  if (intervalId.value) {
    window.clearInterval(intervalId.value);
  }
};

onMounted(() => {
  startOtpCooldown();
});

onUnmounted(() => {
  stopOtpCooldown();
});
</script>

<template>
  <div
    class="bg-stone-950/30 w-full relative z-10 rounded-md border border-electric-green/30 p-4 flex flex-col max-w-sm mx-auto"
  >
    <h2 class="font-playfair text-xl mb-2 text-center">Verify OTP</h2>
    <span class="text-sm text-yellow-50/70 mb-6 text-center">
      We've sent a 6 digit code to your email.</span
    >

    <p class="text-xs text-rose-500 mb-2" v-if="errorText">{{ errorText }}.</p>

    <div class="flex gap-x-2 mb-4">
      <input
        v-for="(digit, index) in otp"
        :key="index"
        type="text"
        pattern="[0-9]*"
        :value="digit"
        class="bg-neutral-800 py-1.5 text-center border-electric-green/30 focus:border-electric-green duration-200 border w-1/6 outline-none rounded-md text-base"
        :ref="
          (el) => {
            if (el) inputs[index] = el as HTMLElement;
          }
        "
        @input="(e) => onInput(index, e)"
        @keydown="(e) => onKeydown(index, e)"
      />
    </div>

    <button
      class="cursor-pointer text-xs bg-electric-green hover:bg-electric-green/80 rounded-md py-1.5 text-cursed-black flex gap-x-1 justify-center active:translate-y-px duration-200"
      @click="verifyOtp"
    >
      Verify and Continue
    </button>

    <div class="flex mt-2 items-start">
      <div class="flex-1">
        <div class="group flex gap-x-1 items-center cursor-pointer" @click="$router.push('/login')">
          <Arrow
            class="stroke-stone-500 group-hover:stroke-stone-600 rotate-180 w-3 h-3 duration-200"
          ></Arrow>
          <span class="text-xs text-stone-500 group-hover:text-stone-600 duration-200">Back</span>
        </div>
      </div>
      <div class="text-right flex flex-col">
        <button
          class="text-xs cursor-pointer duration-200 text-electric-green"
          :class="{ 'pointer-events-none text-stone-500': timeLeft !== 0 }"
          @click="resendOtp"
        >
          Resend Code
        </button>
        <p class="text-xs text-stone-500">{{ timeLeft }}s</p>
      </div>
    </div>
  </div>
</template>
