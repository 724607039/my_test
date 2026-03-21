# 代码审查工具 (Code Auditor)

一个全局的代码审查工具，用于审查Vue3项目的代码效果问题，包括性能、代码质量、可维护性等方面。

## 功能特性

- **性能审查**：检查未使用的变量、导入，以及可能影响性能的代码
- **代码质量**：检查代码质量问题，如eval使用、无用的代码等
- **Vue相关**：检查Vue组件的使用规范，如未使用的组件、重复的属性等
- **样式审查**：检查代码样式和格式
- **可维护性**：检查代码复杂度和文件长度

## 安装

### 全局安装

```bash
# 进入工具目录
cd code-auditor

# 全局安装
npm link
```

### 局部安装

```bash
# 进入项目目录
cd your-project

# 安装为开发依赖
npm install --save-dev path/to/code-auditor
```

## 使用方法

### 全局使用

```bash
# 审查当前目录
code-auditor

# 审查指定目录
code-auditor /path/to/project

# 使用自定义配置
code-auditor --config /path/to/config.json

# 安静模式（只显示错误）
code-auditor --quiet
```

### 局部使用

在package.json中添加脚本：

```json
"scripts": {
  "audit": "code-auditor"
}
```

然后运行：

```bash
npm run audit
```

## 配置文件

可以创建一个 `code-auditor.json` 配置文件来自定义审查规则：

```json
{
  "extensions": [".vue", ".js", ".ts"],
  "ignoreDirs": ["node_modules", ".git", "dist"],
  "rules": {
    "unusedVariables": true,
    "unusedImports": true,
    "consoleUsage": true,
    "debuggerUsage": true,
    "evalUsage": true,
    "withUsage": true,
    "uselessConcat": true,
    "uselessReturn": true,
    "duplicateImports": true,
    "complexity": true,
    "maxLines": true,
    "vueUnusedComponents": true,
    "vueDuplicateAttributes": true
  },
  "thresholds": {
    "maxComplexity": 10,
    "maxLines": 300
  }
}
```

## 审查规则说明

### 性能相关
- `unusedVariables` - 检查未使用的变量
- `unusedImports` - 检查未使用的导入
- `consoleUsage` - 警告使用console
- `debuggerUsage` - 警告使用debugger

### 代码质量
- `evalUsage` - 禁止使用eval
- `withUsage` - 禁止使用with语句
- `uselessConcat` - 禁止无用的字符串连接
- `uselessReturn` - 禁止无用的return语句
- `duplicateImports` - 禁止重复导入

### Vue相关
- `vueUnusedComponents` - 检查未使用的Vue组件
- `vueDuplicateAttributes` - 检查Vue模板中重复的属性

### 可维护性
- `complexity` - 检查代码复杂度
- `maxLines` - 限制文件行数

## 示例输出

```bash
$ code-auditor
Starting code audit...
=====================
Analyzing: /path/to/project/src/App.vue
[WARNING] /path/to/project/src/App.vue: Console usage found: console.log(
[WARNING] /path/to/project/src/App.vue: High complexity (15)
Analyzing: /path/to/project/src/components/HelloWorld.vue
[ERROR] /path/to/project/src/components/HelloWorld.vue: Unused variable 'unusedVar'
=====================
Audit completed with 1 errors and 2 warnings
```

## 注意事项

- 本工具使用正则表达式进行简单的代码分析，可能会产生误报
- 对于复杂的项目，建议结合ESLint等专业工具使用
- 定期运行代码审查可以帮助保持代码质量和性能

## 许可证

MIT
