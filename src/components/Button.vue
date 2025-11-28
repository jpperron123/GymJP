<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <button :class="[
    'cursor-pointer inline-flex items-center justify-center px-4 py-2 rounded-full font-semibold transition',
    variant === 'primary' && 'bg-red-700 text-white hover:bg-red-800',
    variant === 'secondary' && 'bg-gray-200 text-gray-700 hover:bg-gray-300',
    variant === 'success' && 'bg-green-600 text-white hover:bg-green-700',
    variant === 'danger' && 'bg-red-600 text-white hover:bg-red-700',
    disabled && 'opacity-50 cursor-not-allowed',
    customClass
  ]" :disabled="disabled">
    <slot />
  </button>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary', // options: primary, secondary, success, danger
  },
  disabled: {
    type: Boolean,
    default: false
  },
  customClass: {
    type: String,
    default: '',
  },
})
</script>
