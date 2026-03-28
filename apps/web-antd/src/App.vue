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
      <main
        class="canvas"
        @dragover="handleDragOver"
        @drop="handleDrop"
        @dragleave="handleDragLeave"
      >
        <!-- 放置指示器 -->
        <div v-if="dropIndicatorIndex !== null" class="drop-indicator" />

        <!-- 放置区域 - 最开始 -->
        <div
          class="drop-zone"
          :class="{ 'drop-zone-active': dropIndicatorIndex === 0 }"
          @dragover.prevent="handleDragOverZone(0)"
          @drop.prevent="handleDropOnZone(0)"
        />

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

          <!-- 放置区域 - 每个组件之后 -->
          <div
            class="drop-zone"
            :class="{ 'drop-zone-active': dropIndicatorIndex === index + 1 }"
            @dragover.prevent="handleDragOverZone(index + 1)"
            @drop.prevent="handleDropOnZone(index + 1)"
          />
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
import { ref } from 'vue';
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
type TextProps = {
  content: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  color: string;
};

type ImageProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

type TableProps = {
  data: string[][];
};

interface Component {
  id: string;
  type: 'text' | 'image' | 'table';
  props: TextProps | ImageProps | TableProps;
}

// 组件列表
const components = ref<Component[]>([]);

// 选中的组件
const selectedComponent = ref<Component | null>(null);

// 拖拽放置位置指示器
const dropIndicatorIndex = ref<number | null>(null);

// 拖拽开始事件
const handleDragStart = (event: DragEvent, componentType: string) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('componentType', componentType);
  }
};

// 拖拽悬停在画布上
const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
};

// 拖拽离开画布
const handleDragLeave = () => {
  dropIndicatorIndex.value = null;
};

// 悬停在特定放置区域
const handleDragOverZone = (index: number) => {
  dropIndicatorIndex.value = index;
};

// 在特定位置放下组件
const handleDropOnZone = (index: number) => {
  event?.preventDefault();
  if (event?.dataTransfer) {
    const componentType = event.dataTransfer.getData('componentType');
    addComponentAtIndex(componentType, index);
  }
  dropIndicatorIndex.value = null;
};

// 添加组件到指定位置
const addComponentAtIndex = (componentType: string, index: number) => {
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

  components.value.splice(index, 0, newComponent);
  selectedComponent.value = newComponent;
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
const updateComponentProps = (
  index: number,
  propName: string,
  value: unknown
) => {
  if (components.value[index]) {
    // 使用类型断言来安全地更新属性
    const component = components.value[index];
    (component.props as Record<string, unknown>)[propName] = value;
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
    ElMessage.error('生成Word文档失败，请重试');
  }
};

// 打印内容
const printContent = () => {
  window.print();
};
</script>

<style scoped>
/* 全局样式优化 */
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 头部样式 */
.app-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.app-header h1 {
  font-size: 22px;
  margin: 0;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 主要内容区域 */
.app-content {
  flex: 1;
  display: flex;
  padding: 24px;
  gap: 24px;
}

/* 左侧组件库 */
.component-library {
  width: 220px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.component-library h2 {
  font-size: 16px;
  margin: 0 0 20px 0;
  color: #333;
  font-weight: 600;
  padding-bottom: 12px;
  border-bottom: 2px solid #667eea;
}

.component-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.component-item {
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
  padding: 14px 16px;
  border-radius: 10px;
  cursor: move;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 500;
  color: #555;
  border: 1px solid transparent;
}

.component-item:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.component-item-icon {
  margin-right: 8px;
}

/* 画布区域 */
.canvas {
  flex: 1;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  min-height: 600px;
  position: relative;
}

.canvas-item {
  background: #fff;
  border: 2px solid #e8e8e8;
  border-radius: 12px;
  margin-bottom: 0;
  transition: all 0.3s ease;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.canvas-item:hover {
  border-color: #667eea;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15);
  transform: translateY(-2px);
}

.drop-zone {
  height: 8px;
  margin: 8px 0;
  border-radius: 8px;
  transition: all 0.3s ease;
  background-color: transparent;
}

.drop-zone:hover,
.drop-zone-active {
  height: 48px;
  background: linear-gradient(
    135deg,
    rgba(102, 126, 234, 0.1) 0%,
    rgba(118, 75, 162, 0.1) 100%
  );
  border: 2px dashed #667eea;
  border-radius: 8px;
}

.drop-indicator {
  position: absolute;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  pointer-events: none;
  border-radius: 2px;
}

/* 组件头部 */
.component-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid #e8e8e8;
}

.component-header span {
  font-weight: 600;
  color: #495057;
  font-size: 14px;
}

/* 组件内容 */
.component-content {
  padding: 16px;
}

/* 画布占位符 */
.canvas-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #adb5bd;
}

.canvas-placeholder p {
  margin-top: 16px;
  font-size: 16px;
}

/* 右侧属性面板 */
.property-panel {
  width: 320px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.property-panel h2 {
  font-size: 16px;
  margin: 0 0 20px 0;
  color: #333;
  font-weight: 600;
  padding-bottom: 12px;
  border-bottom: 2px solid #667eea;
}

.property-placeholder {
  text-align: center;
  color: #adb5bd;
  padding: 60px 20px;
  font-size: 14px;
}

.property-group h3 {
  font-size: 14px;
  margin: 16px 0 12px 0;
  color: #667eea;
  font-weight: 600;
}

.slider-value {
  margin-left: 12px;
  font-size: 14px;
  color: #667eea;
  font-weight: 600;
}

.table-data-display {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 16px;
  border-radius: 10px;
}

.table-data-display p {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #495057;
}

.table-data-display p:last-child {
  margin-bottom: 0;
}

/* 打印样式 - 1:1还原显示内容 */
@media print {
  @page {
    size: A4 portrait;
    margin: 20mm;
  }

  html,
  body {
    width: 210mm;
    height: 297mm;
    margin: 0;
    padding: 0;
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }

  .app {
    display: block;
    width: 100%;
    height: 100%;
    background: #fff;
  }

  .app-header,
  .component-library,
  .property-panel,
  .no-selection {
    display: none !important;
  }

  .app-content {
    display: block;
    padding: 0;
    margin: 0;
    width: 100%;
    height: auto;
  }

  .canvas {
    display: block;
    width: 100%;
    height: auto;
    padding: 0;
    margin: 0;
    box-shadow: none;
    border: none;
    min-height: auto;
    background-color: transparent;
  }

  .canvas-item {
    display: block;
    width: 100%;
    height: auto;
    margin-bottom: 10px;
    page-break-inside: avoid;
    page-break-after: auto;
    background-color: #f9f9f9;
    border: 1px solid #e8e8e8;
    border-radius: 4px;
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

  .text-content,
  .image-component,
  .table-component {
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }

  .text-content p {
    margin: 0;
    line-height: 1.5;
  }

  .image-component img {
    max-width: 100%;
    height: auto;
  }

  .table-data-display {
    background-color: #f9f9f9;
    padding: 12px;
    border-radius: 4px;
  }

  .table-data-display p {
    margin: 0 0 8px 0;
    font-size: 14px;
    line-height: 1.5;
  }

  .table-data-display p:last-child {
    margin-bottom: 0;
  }
}
</style>
