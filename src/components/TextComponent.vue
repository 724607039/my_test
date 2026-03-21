<template>
  <div class="text-component">
    <p>{{ content }}</p>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

defineProps({
  content: {
    type: String,
    default: '文本内容',
  },
});
</script>

<style scoped>
.text-component {
  padding: 10px;
}

.text-component p {
  margin: 0;
  font-size: 16px;
  line-height: 1.5;
}
</style>
