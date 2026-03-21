<template>
  <div class="image-component">
    <div v-if="src" class="image-preview">
      <img :src="src" :alt="alt" />
      <div class="image-actions">
        <button @click="removeImage">移除</button>
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          style="display: none"
          @change="handleFileUpload"
        />
        <button @click="$refs.fileInput.click()">更换图片</button>
      </div>
    </div>
    <div v-else class="placeholder">
      <input
        v-model="localSrc"
        type="text"
        placeholder="输入图片URL"
        @input="updateSrc"
      />
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        style="display: none"
        @change="handleFileUpload"
      />
      <button @click="$refs.fileInput.click()">上传本地图片</button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, ref, watch } from 'vue';

const props = defineProps({
  src: {
    type: String,
    default: '',
  },
  alt: {
    type: String,
    default: '图片',
  },
});

const emit = defineEmits(['update:src']);

const localSrc = ref(props.src);
const fileInput = ref(null);

watch(
  () => props.src,
  (newValue) => {
    localSrc.value = newValue;
  }
);

const updateSrc = () => {
  emit('update:src', localSrc.value);
};

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target.result;
      emit('update:src', imageUrl);
    };
    reader.readAsDataURL(file);
  }
};

const removeImage = () => {
  emit('update:src', '');
};
</script>

<style scoped>
.image-component {
  padding: 10px;
}

.image-preview {
  position: relative;
  display: inline-block;
}

.image-preview img {
  max-width: 100%;
  max-height: 300px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.image-actions {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  background-color: rgba(0, 0, 0, 0.6);
  padding: 8px;
  border-radius: 4px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-preview:hover .image-actions {
  opacity: 1;
}

.image-actions button {
  background-color: white;
  color: #333;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 12px;
}

.placeholder {
  border: 2px dashed #ddd;
  border-radius: 4px;
  padding: 30px 20px;
  text-align: center;
  background-color: #f9f9f9;
}

.placeholder input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  margin-bottom: 10px;
}

.placeholder button {
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
}

.placeholder button:hover {
  background-color: #45a049;
}
</style>
