/**
 * 组件类型定义
 */

// 组件基础属性
interface BaseComponent {
  id: string;
  type: string;
  props: Record<string, any>;
}

// 文本组件属性
interface TextComponentProps {
  content: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  color?: string;
}

// 图片组件属性
interface ImageComponentProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

// 表格组件属性
interface TableComponentProps {
  data: string[][];
  headers?: string[];
  bordered?: boolean;
}

// 文本组件
export interface TextComponent extends BaseComponent {
  type: 'TextComponent';
  props: TextComponentProps;
}

// 图片组件
export interface ImageComponent extends BaseComponent {
  type: 'ImageComponent';
  props: ImageComponentProps;
}

// 表格组件
export interface TableComponent extends BaseComponent {
  type: 'TableComponent';
  props: TableComponentProps;
}

// 所有组件类型
export type ComponentType = TextComponent | ImageComponent | TableComponent;

// 组件库项
export interface ComponentLibraryItem {
  id: string;
  name: string;
  type: string;
  props: Record<string, any>;
}
