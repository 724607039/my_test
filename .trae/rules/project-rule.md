<br />

&#x20;

1. ‌**技术栈**‌：本项目使用Vue 3（`<script setup>`）、TypeScript、Vite、Pinia、Element Plus、vxe-table 、 axios。包管理器为pnpm。‌
2. ‌**目录结构**‌：采用Monorepo。应用代码在`apps/web-antd/`，共享包（工具函数、类型定义、状态管理等）在`packages/`下。‌
3. ‌**文件命名**‌：
   - Vue组件：`PascalCase.vue`。
   - TS工具文件：`camelCase.ts`。
   - 路由视图目录：`kebab-case/index.vue`。‌
4. ‌**组件模板**‌：在`<script setup lang="ts">`中，按以下顺序组织代码：导入依赖 → 定义Props/Emits接口 → 初始化Pinia Store → 声明`ref`/`computed` → 生命周期钩子 → 方法定义。‌
5. ‌**样式**‌：模板中优先使用SCSS CSS类。组件样式使用`<style scoped>`。
6. ‌**TypeScript**‌：为组件Props、Emits及API响应数据定义明确的`interface`或`type`，存放于`packages/types/`目录。‌
7. ‌\*\*数据表格（vxe-table）\*\*‌：
   - 查询表单Schema定义在独立的`querySchema`函数中。‌
   - 表格列定义在`columns`配置数组中，复杂单元格渲染使用`slots`。‌
   - 表格组件中，操作按钮的显示需结合权限判断（使用`useAccess`）。
8. ‌**代码修改原则**‌：
   - 每次变更需确保现有功能完好，改动范围应最小化。‌
   - 依据代码逻辑进行修改，现有注释仅供参考，可能未及时更新。‌
   - 优先完成指定的小范围修改任务，避免未经评估便改动项目核心结构。‌
9. ‌**API与状态管理**‌：数据请求函数应统一置于`packages/effects/`或类似目录。状态管理使用Pinia，Store模块存放于`packages/stores/`。‌
10. ‌**工具函数**‌：通用工具函数应置于`packages/utils/`，并配有清晰的JSDoc或类型注释。

