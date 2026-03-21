<template>
  <div class="app">
    <!-- 顶部操作栏 -->
    <div class="toolbar">
      <h1>低代码拖拽组件</h1>
      <div class="actions">
        <button @click="generateWord">生成Word</button>
        <button @click="print">打印</button>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 左侧组件库 -->
      <div class="component-library">
        <h2>组件库</h2>
        <div class="components">
          <div
            v-for="component in components"
            :key="component.id"
            class="component-item"
            draggable="true"
            @dragstart="onDragStart($event, component)"
          >
            {{ component.name }}
          </div>
        </div>
      </div>

      <!-- 中间画布 -->
      <div class="canvas" @drop="onDrop" @dragover.prevent>
        <div
          v-for="(item, index) in canvasItems"
          :key="item.id"
          class="canvas-item"
          :class="item.type"
        >
          <div class="item-content">
            <component
              :is="item.type"
              v-bind="item.props"
              @update:src="
                (value) => {
                  item.props.src = value;
                  updateCanvas();
                }
              "
              @update:data="
                (value) => {
                  item.props.data = value;
                  updateCanvas();
                }
              "
            />
          </div>
          <div class="item-actions">
            <button @click="removeItem(index)">删除</button>
          </div>
        </div>
        <div v-if="canvasItems.length === 0" class="empty-canvas">
          拖拽组件到此处
        </div>
      </div>

      <!-- 右侧属性面板 -->
      <div class="property-panel">
        <h2>属性编辑</h2>
        <div v-if="selectedItem" class="properties">
          <div class="property">
            <label>组件类型</label>
            <input v-model="selectedItem.type" type="text" disabled />
          </div>
          <div v-if="selectedItem.props" class="property-group">
            <h3>属性</h3>
            <div
              v-for="(value, key) in selectedItem.props"
              :key="key"
              class="property"
            >
              <label>{{ key }}</label>
              <input
                v-model="selectedItem.props[key]"
                type="text"
                @input="updateCanvas"
              />
            </div>
          </div>
        </div>
        <div v-else class="no-selection">选择一个组件进行编辑</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { generateWordFile } from './utils/wordGenerator.js';

// 组件库
const components = ref([
  {
    id: 'text',
    name: '文本',
    type: 'TextComponent',
    props: { content: '文本内容' },
  },
  {
    id: 'image',
    name: '图片',
    type: 'ImageComponent',
    props: { src: '', alt: '图片' },
  },
  {
    id: 'table',
    name: '表格',
    type: 'TableComponent',
    props: {
      data: [
        [1, 2],
        [3, 4],
      ],
    },
  },
]);

// 画布上的组件
const canvasItems = ref([]);
// 选中的组件
const selectedItem = ref(null);

// 拖拽开始
const onDragStart = (event, component) => {
  event.dataTransfer.setData('application/json', JSON.stringify(component));
};

// 拖拽结束
const onDrop = (event) => {
  event.preventDefault();
  const component = JSON.parse(event.dataTransfer.getData('application/json'));
  const newItem = {
    id: Date.now(),
    type: component.type,
    props: { ...component.props },
  };
  canvasItems.value.push(newItem);
};

// 删除组件
const removeItem = (index) => {
  canvasItems.value.splice(index, 1);
  if (
    selectedItem.value &&
    selectedItem.value.id === canvasItems.value[index]?.id
  ) {
    selectedItem.value = null;
  }
};

// 生成Word文件
const generateWord = () => {
  generateWordFile(canvasItems.value);
};

// 打印
const print = () => {
  window.print();
};

// 更新画布
const updateCanvas = () => {
  // 触发视图更新
  canvasItems.value = [...canvasItems.value];
};
</script>

<style scoped>
.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.toolbar {
  height: 60px;
  background-color: #4caf50;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toolbar h1 {
  margin: 0;
  font-size: 20px;
}

.actions button {
  margin-left: 10px;
  padding: 8px 16px;
  background-color: white;
  color: #4caf50;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.actions button:hover {
  background-color: #f0f0f0;
}

.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.component-library {
  width: 200px;
  background-color: white;
  border-right: 1px solid #ddd;
  padding: 20px;
  overflow-y: auto;
}

.component-library h2 {
  margin-top: 0;
  font-size: 16px;
  color: #333;
}

.components {
  margin-top: 20px;
}

.component-item {
  padding: 10px;
  background-color: #f0f0f0;
  margin-bottom: 10px;
  border-radius: 4px;
  cursor: grab;
  text-align: center;
}

.component-item:hover {
  background-color: #e0e0e0;
}

.canvas {
  flex: 1;
  background-color: #fff;
  margin: 20px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 20px;
  overflow-y: auto;
  position: relative;
}

.empty-canvas {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #999;
  font-size: 18px;
}

.canvas-item {
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  position: relative;
}

.item-actions {
  position: absolute;
  top: 10px;
  right: 10px;
}

.item-actions button {
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 12px;
}

.property-panel {
  width: 250px;
  background-color: white;
  border-left: 1px solid #ddd;
  padding: 20px;
  overflow-y: auto;
}

.property-panel h2 {
  margin-top: 0;
  font-size: 16px;
  color: #333;
}

.properties {
  margin-top: 20px;
}

.property {
  margin-bottom: 15px;
}

.property label {
  display: block;
  margin-bottom: 5px;
  font-size: 14px;
  color: #666;
}

.property input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.property-group h3 {
  margin: 20px 0 10px 0;
  font-size: 14px;
  color: #333;
}

.no-selection {
  margin-top: 20px;
  color: #999;
  text-align: center;
}
</style>
