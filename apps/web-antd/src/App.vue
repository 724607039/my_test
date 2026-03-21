<template>
  <div class="app">
    <!-- 顶部操作栏 -->
    <header class="app-header">
      <h1>低代码可拖拽组件系统</h1>
      <div class="header-actions">
        <el-button type="primary" size="large" @click="generateWord">
          生成Word
        </el-button>
        <el-button
          type="default"
          size="large"
          style="margin-left: 10px"
          @click="printContent"
        >
          打印
        </el-button>
      </div>
    </header>

    <div class="app-content">
      <!-- 左侧组件库 -->
      <aside class="component-library">
        <h2>组件库</h2>
        <div class="component-list">
          <div
            class="component-item"
            draggable="true"
            @dragstart="handleDragStart($event, 'text')"
          >
            <el-icon><Document /></el-icon>
            <span>文本组件</span>
          </div>
          <div
            class="component-item"
            draggable="true"
            @dragstart="handleDragStart($event, 'image')"
          >
            <el-icon><Picture /></el-icon>
            <span>图片组件</span>
          </div>
          <div
            class="component-item"
            draggable="true"
            @dragstart="handleDragStart($event, 'table')"
          >
            <el-icon><Grid /></el-icon>
            <span>表格组件</span>
          </div>
        </div>
      </aside>

      <!-- 中间画布 -->
      <main class="canvas" @drop="handleDrop" @dragover.prevent>
        <div
          v-for="(component, index) in components"
          :key="component.id"
          class="canvas-item"
        >
          <div class="component-header">
            <span>{{ getComponentName(component.type) }}</span>
            <el-button
              type="text"
              danger
              size="small"
              @click="removeComponent(index)"
            >
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
          <div class="component-content">
            <!-- 文本组件 -->
            <TextComponent
              v-if="component.type === 'text'"
              :content="component.props.content"
              :font-size="component.props.fontSize"
              :font-weight="component.props.fontWeight"
              :color="component.props.color"
            />
            <!-- 图片组件 -->
            <ImageComponent
              v-else-if="component.type === 'image'"
              :src="component.props.src"
              :alt="component.props.alt"
              :width="component.props.width"
              :height="component.props.height"
              @update:src="(value) => updateComponentProps(index, 'src', value)"
              @update:alt="(value) => updateComponentProps(index, 'alt', value)"
              @update:width="
                (value) => updateComponentProps(index, 'width', value)
              "
              @update:height="
                (value) => updateComponentProps(index, 'height', value)
              "
            />
            <!-- 表格组件 -->
            <TableComponent
              v-else-if="component.type === 'table'"
              :data="component.props.data"
              @update:data="
                (value) => updateComponentProps(index, 'data', value)
              "
            />
          </div>
        </div>
        <div v-if="components.length === 0" class="canvas-placeholder">
          <el-icon><Folder /></el-icon>
          <p>从左侧拖拽组件到此处</p>
        </div>
      </main>

      <!-- 右侧属性面板 -->
      <aside class="property-panel">
        <h2>属性编辑</h2>
        <div v-if="selectedComponent" class="property-content">
          <el-form label-width="80px">
            <!-- 文本组件属性 -->
            <template v-if="selectedComponent.type === 'text'">
              <el-form-item label="文本内容">
                <el-input
                  v-model="selectedComponent.props.content"
                  @change="updateSelectedComponent"
                />
              </el-form-item>
              <el-form-item label="字体大小">
                <el-slider
                  v-model="selectedComponent.props.fontSize"
                  :min="12"
                  :max="36"
                  @change="updateSelectedComponent"
                />
                <span class="slider-value"
                  >{{ selectedComponent.props.fontSize }}px</span
                >
              </el-form-item>
              <el-form-item label="字体粗细">
                <el-radio-group
                  v-model="selectedComponent.props.fontWeight"
                  @change="updateSelectedComponent"
                >
                  <el-radio-button label="normal">正常</el-radio-button>
                  <el-radio-button label="bold">粗体</el-radio-button>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="颜色">
                <el-input
                  v-model="selectedComponent.props.color"
                  placeholder="#000000"
                  @change="updateSelectedComponent"
                />
              </el-form-item>
            </template>

            <!-- 图片组件属性 -->
            <template v-else-if="selectedComponent.type === 'image'">
              <el-form-item label="图片URL">
                <el-input
                  v-model="selectedComponent.props.src"
                  @change="updateSelectedComponent"
                />
              </el-form-item>
              <el-form-item label="图片描述">
                <el-input
                  v-model="selectedComponent.props.alt"
                  @change="updateSelectedComponent"
                />
              </el-form-item>
              <el-form-item label="宽度">
                <el-slider
                  v-model="selectedComponent.props.width"
                  :min="100"
                  :max="800"
                  @change="updateSelectedComponent"
                />
                <span class="slider-value"
                  >{{ selectedComponent.props.width }}px</span
                >
              </el-form-item>
              <el-form-item label="高度">
                <el-slider
                  v-model="selectedComponent.props.height"
                  :min="100"
                  :max="600"
                  @change="updateSelectedComponent"
                />
                <span class="slider-value"
                  >{{ selectedComponent.props.height }}px</span
                >
              </el-form-item>
            </template>

            <!-- 表格组件属性 -->
            <template v-else-if="selectedComponent.type === 'table'">
              <el-form-item label="表格数据">
                <div class="table-data-display">
                  <p>行数: {{ selectedComponent.props.data.length }}</p>
                  <p>
                    列数: {{ selectedComponent.props.data[0]?.length || 0 }}
                  </p>
                </div>
              </el-form-item>
            </template>
          </el-form>
        </div>
        <div v-else class="property-placeholder">
          <p>请选择一个组件进行编辑</p>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import {
  Document,
  Picture,
  Grid,
  Close,
  Folder,
} from '@element-plus/icons-vue';
import TextComponent from './components/TextComponent.vue';
import ImageComponent from './components/ImageComponent.vue';
import TableComponent from './components/TableComponent.vue';
import { generateWordDocument } from './utils/wordGenerator';

// 组件类型定义
interface Component {
  id: string;
  type: 'text' | 'image' | 'table';
  props: any;
}

// 组件列表
const components = ref<Component[]>([]);

// 选中的组件
const selectedComponent = ref<Component | null>(null);

// 拖拽开始事件
const handleDragStart = (event: DragEvent, componentType: string) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('componentType', componentType);
  }
};

// 拖拽结束事件
const handleDrop = (event: DragEvent) => {
  event.preventDefault();
  if (event.dataTransfer) {
    const componentType = event.dataTransfer.getData('componentType');
    addComponent(componentType);
  }
};

// 添加组件
const addComponent = (componentType: string) => {
  let newComponent: Component;
  const id = Date.now().toString();

  switch (componentType) {
    case 'text':
      newComponent = {
        id,
        type: 'text',
        props: {
          content: '文本内容',
          fontSize: 16,
          fontWeight: 'normal' as 'normal' | 'bold',
          color: '#000000',
        },
      };
      break;
    case 'image':
      newComponent = {
        id,
        type: 'image',
        props: {
          src: '',
          alt: '图片',
          width: 300,
          height: 200,
        },
      };
      break;
    case 'table':
      newComponent = {
        id,
        type: 'table',
        props: {
          data: [
            ['单元格1', '单元格2'],
            ['单元格3', '单元格4'],
          ],
        },
      };
      break;
    default:
      return;
  }

  components.value.push(newComponent);
  selectedComponent.value = newComponent;
};

// 移除组件
const removeComponent = (index: number) => {
  components.value.splice(index, 1);
  if (
    selectedComponent.value &&
    selectedComponent.value.id === components.value[index]?.id
  ) {
    selectedComponent.value = null;
  }
};

// 获取组件名称
const getComponentName = (type: string) => {
  const names = {
    text: '文本组件',
    image: '图片组件',
    table: '表格组件',
  };
  return names[type as keyof typeof names] || type;
};

// 更新组件属性
const updateComponentProps = (index: number, propName: string, value: any) => {
  if (components.value[index]) {
    components.value[index].props[propName] = value;
  }
};

// 更新选中的组件
const updateSelectedComponent = () => {
  // 组件属性已通过双向绑定更新
};

// 生成Word文档
const generateWord = () => {
  try {
    generateWordDocument(components.value);
    ElMessage.success('Word文档生成成功！');
  } catch (error) {
    console.error('生成Word文档失败:', error);
    ElMessage.error('生成Word文档失败，请重试');
  }
};

// 打印内容
const printContent = () => {
  window.print();
};
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.app-header {
  background-color: #fff;
  padding: 0 20px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.app-header h1 {
  font-size: 20px;
  margin: 0;
  color: #1890ff;
}

.app-content {
  flex: 1;
  display: flex;
  padding: 20px;
  gap: 20px;
}

.component-library {
  width: 200px;
  background-color: #fff;
  border-radius: 4px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.component-library h2 {
  font-size: 16px;
  margin: 0 0 16px 0;
  color: #333;
}

.component-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.component-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;
  cursor: move;
  transition: all 0.3s ease;
}

.component-item:hover {
  background-color: #e6f7ff;
  transform: translateY(-2px);
}

.canvas {
  flex: 1;
  background-color: #fff;
  border-radius: 4px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-height: 600px;
  position: relative;
}

.canvas-item {
  background-color: #f9f9f9;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.canvas-item:hover {
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.15);
}

.component-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: #f0f0f0;
  border-bottom: 1px solid #e8e8e8;
  border-radius: 4px 4px 0 0;
}

.component-content {
  padding: 12px;
}

.canvas-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #ccc;
}

.canvas-placeholder p {
  margin-top: 16px;
  font-size: 16px;
}

.property-panel {
  width: 300px;
  background-color: #fff;
  border-radius: 4px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.property-panel h2 {
  font-size: 16px;
  margin: 0 0 16px 0;
  color: #333;
}

.property-placeholder {
  text-align: center;
  color: #ccc;
  padding: 40px 0;
}

.slider-value {
  margin-left: 12px;
  font-size: 14px;
  color: #666;
}

.table-data-display {
  background-color: #f9f9f9;
  padding: 12px;
  border-radius: 4px;
}

.table-data-display p {
  margin: 0 0 8px 0;
  font-size: 14px;
}

.table-data-display p:last-child {
  margin-bottom: 0;
}

/* 打印样式 */
@media print {
  .app-header,
  .component-library,
  .property-panel {
    display: none;
  }

  .app-content {
    padding: 0;
  }

  .canvas {
    box-shadow: none;
    min-height: auto;
  }

  .canvas-item {
    page-break-inside: avoid;
  }
}
</style>
