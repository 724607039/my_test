<template>
  <div class="text-component">
    <p
      :style="{
        fontSize: props.fontSize + 'px',
        fontWeight: props.fontWeight,
        color: props.color,
      }"
    >
      {{ props.content }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

const props = defineProps({
  content: {
    type: String,
    default: '文本内容',
  },
  fontSize: {
    type: Number,
    default: 16,
  },
  fontWeight: {
    type: String as () => 'normal' | 'bold',
    default: 'normal',
  },
  color: {
    type: String,
    default: '#000000',
  },
});
</script>

<style scoped>
.text-component {
  padding: 10px;
}

.text-component p {
  margin: 0;
  line-height: 1.5;
}
</style>
