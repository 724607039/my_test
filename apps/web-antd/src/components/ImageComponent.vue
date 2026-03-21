<template>
  <div class="image-component">
    <div v-if="props.src" class="image-preview">
      <img
        :src="props.src"
        :alt="props.alt"
        :style="{
          width: props.width + 'px',
          height: props.height + 'px',
        }"
      />
      <div class="image-actions">
        <el-button type="primary" danger size="small" @click="removeImage">
          移除
        </el-button>
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          style="display: none"
          @change="handleFileUpload"
        />
        <el-button type="primary" size="small" @click="$refs.fileInput.click()">
          更换图片
        </el-button>
      </div>
    </div>
    <div v-else class="placeholder">
      <el-input
        v-model="localSrc"
        placeholder="输入图片URL"
        style="margin-bottom: 10px"
        @input="updateSrc"
      />
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        style="display: none"
        @change="handleFileUpload"
      />
      <el-button type="primary" @click="$refs.fileInput.click()">
        上传本地图片
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, watch } from 'vue';

const props = defineProps({
  src: {
    type: String,
    default: '',
  },
  alt: {
    type: String,
    default: '图片',
  },
  width: {
    type: Number,
    default: 300,
  },
  height: {
    type: Number,
    default: 200,
  },
});

const emit = defineEmits([
  'update:src',
  'update:alt',
  'update:width',
  'update:height',
]);

const localSrc = ref(props.src);
const fileInput = ref<HTMLInputElement | null>(null);

watch(
  () => props.src,
  (newValue) => {
    localSrc.value = newValue;
  }
);

const updateSrc = () => {
  emit('update:src', localSrc.value);
};

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
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

.placeholder {
  border: 2px dashed #ddd;
  border-radius: 4px;
  padding: 30px 20px;
  text-align: center;
  background-color: #f9f9f9;
}
</style>
