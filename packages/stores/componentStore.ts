/**
 * 组件状态管理
 */

import { defineStore } from 'pinia';
import type {
  ComponentType,
  ComponentLibraryItem,
} from '@packages/types/component';

export const useComponentStore = defineStore('component', {
  state: () => ({
    // 组件库
    /**
     * 组件库
     * 包含所有可用的组件类型，每个组件项包含组件ID、名称、类型和默认属性。
     * 组件类型包括文本、图片、表格组件
     */
    componentLibrary: [
      {
        id: 'text',
        name: '文本',
        type: 'TextComponent',
        props: {
          content: '文本内容',
          fontSize: 16,
          fontWeight: 'normal',
          color: '#000000',
        },
      },
      {
        id: 'image',
        name: '图片',
        type: 'ImageComponent',
        props: { src: '', alt: '图片', width: 300, height: 200 },
      },
      {
        id: 'table',
        name: '表格',
        type: 'TableComponent',
        props: {
          data: [
            ['1', '2'],
            ['3', '4'],
          ],
          headers: ['列1', '列2'],
          bordered: true,
        },
      },
    ] as ComponentLibraryItem[],

    // 画布组件
    canvasItems: [] as ComponentType[],

    // 选中的组件
    selectedItem: null as ComponentType | null,
  }),

  actions: {
    // 添加组件到画布
    /**
     *
     * @param component component对象
     * @returns
     */
    addComponent(component: ComponentLibraryItem) {
      const newItem: ComponentType = {
        id: Date.now().toString(),
        type: component.type as any,
        props: { ...component.props },
      };
      this.canvasItems.push(newItem);
      return newItem;
    },

    // 删除组件
    removeComponent(id: string) {
      const index = this.canvasItems.findIndex((item) => item.id === id);
      if (index !== -1) {
        this.canvasItems.splice(index, 1);
        if (this.selectedItem && this.selectedItem.id === id) {
          this.selectedItem = null;
        }
      }
    },

    // 更新组件属性
    updateComponent(id: string, props: Record<string, any>) {
      const item = this.canvasItems.find((item) => item.id === id);
      if (item) {
        item.props = { ...item.props, ...props };
      }
    },

    // 选择组件
    selectComponent(id: string) {
      this.selectedItem =
        this.canvasItems.find((item) => item.id === id) || null;
    },

    // 清空画布
    clearCanvas() {
      this.canvasItems = [];
      this.selectedItem = null;
    },
  },
});
