/**
 * 代码审查工具核心功能
 */

const fs = require('fs');
const path = require('path');

// 默认配置
const defaultConfig = {
  extensions: ['.vue', '.js', '.ts', '.jsx', '.tsx'],
  ignoreDirs: ['node_modules', '.git', 'dist', 'build', 'coverage'],
  rules: {
    // 性能相关
    unusedVariables: true,
    unusedImports: true,
    consoleUsage: true,
    debuggerUsage: true,

    // 代码质量
    evalUsage: true,
    withUsage: true,
    uselessConcat: true,
    uselessReturn: true,
    duplicateImports: true,

    // 可维护性
    complexity: true,
    maxLines: true,

    // Vue相关
    vueUnusedComponents: true,
    vueDuplicateAttributes: true,
  },
  thresholds: {
    maxComplexity: 10,
    maxLines: 300,
  },
};

// 错误和警告计数
let errorCount = 0;
let warningCount = 0;

// 读取配置文件
function loadConfig(configPath) {
  if (!configPath) {
    return defaultConfig;
  }

  try {
    const configContent = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(configContent);
  } catch (error) {
    console.error(`Error loading config file: ${error.message}`);
    return defaultConfig;
  }
}

// 扫描目录
function scanDirectory(dir, config) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!config.ignoreDirs.includes(file)) {
        scanDirectory(filePath, config);
      }
    } else if (config.extensions.some((ext) => file.endsWith(ext))) {
      analyzeFile(filePath, config);
    }
  }
}

// 分析文件
function analyzeFile(filePath, config) {
  console.log(`Analyzing: ${filePath}`);

  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // 检查未使用的变量
    if (config.rules.unusedVariables) {
      checkUnusedVariables(content, filePath);
    }

    // 检查未使用的导入
    if (config.rules.unusedImports) {
      checkUnusedImports(content, filePath);
    }

    // 检查console使用
    if (config.rules.consoleUsage) {
      checkConsoleUsage(content, filePath);
    }

    // 检查debugger使用
    if (config.rules.debuggerUsage) {
      checkDebuggerUsage(content, filePath);
    }

    // 检查eval使用
    if (config.rules.evalUsage) {
      checkEvalUsage(content, filePath);
    }

    // 检查with使用
    if (config.rules.withUsage) {
      checkWithUsage(content, filePath);
    }

    // 检查无用的字符串连接
    if (config.rules.uselessConcat) {
      checkUselessConcat(content, filePath);
    }

    // 检查无用的return语句
    if (config.rules.uselessReturn) {
      checkUselessReturn(content, filePath);
    }

    // 检查重复导入
    if (config.rules.duplicateImports) {
      checkDuplicateImports(content, filePath);
    }

    // 检查代码复杂度
    if (config.rules.complexity) {
      checkComplexity(content, filePath, config.thresholds.maxComplexity);
    }

    // 检查文件长度
    if (config.rules.maxLines) {
      checkMaxLines(content, filePath, config.thresholds.maxLines);
    }

    // 检查Vue相关问题
    if (filePath.endsWith('.vue')) {
      if (config.rules.vueUnusedComponents) {
        checkVueUnusedComponents(content, filePath);
      }
      if (config.rules.vueDuplicateAttributes) {
        checkVueDuplicateAttributes(content, filePath);
      }
    }
  } catch (error) {
    console.error(`Error analyzing ${filePath}: ${error.message}`);
  }
}

// 检查未使用的变量
function checkUnusedVariables(content, filePath) {
  // 简单的正则表达式，可能会有误报
  const variableRegex = /\b(let|const|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=/g;
  const usageRegex = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\b/g;

  const variables = new Set();
  let match;

  while ((match = variableRegex.exec(content)) !== null) {
    variables.add(match[2]);
  }

  const usedVariables = new Set();
  while ((match = usageRegex.exec(content)) !== null) {
    usedVariables.add(match[1]);
  }

  variables.forEach((variable) => {
    if (
      !usedVariables.has(variable) &&
      !['true', 'false', 'null', 'undefined'].includes(variable)
    ) {
      console.error(`[ERROR] ${filePath}: Unused variable '${variable}'`);
      errorCount++;
    }
  });
}

// 检查未使用的导入
function checkUnusedImports(content, filePath) {
  const importRegex = /import\s+.*?from\s+['"](.*?)['"]/g;
  let match;

  while ((match = importRegex.exec(content)) !== null) {
    const modulePath = match[1];
    // 简单检查：如果模块路径在文件中只出现一次（在import语句中），则可能未使用
    const moduleName = path
      .basename(modulePath)
      .replace(/\.(vue|js|ts|jsx|tsx)$/, '');
    const occurrences = (content.match(new RegExp(moduleName, 'g')) || [])
      .length;

    if (occurrences <= 1) {
      console.warn(
        `[WARNING] ${filePath}: Possibly unused import '${modulePath}'`
      );
      warningCount++;
    }
  }
}

// 检查console使用
function checkConsoleUsage(content, filePath) {
  const consoleRegex = /console\.\w+\(/g;
  let match;

  while ((match = consoleRegex.exec(content)) !== null) {
    console.warn(`[WARNING] ${filePath}: Console usage found: ${match[0]}`);
    warningCount++;
  }
}

// 检查debugger使用
function checkDebuggerUsage(content, filePath) {
  const debuggerRegex = /debugger;/g;
  let match;

  while ((match = debuggerRegex.exec(content)) !== null) {
    console.error(`[ERROR] ${filePath}: Debugger statement found`);
    errorCount++;
  }
}

// 检查eval使用
function checkEvalUsage(content, filePath) {
  const evalRegex = /eval\(/g;
  let match;

  while ((match = evalRegex.exec(content)) !== null) {
    console.error(`[ERROR] ${filePath}: Eval usage found`);
    errorCount++;
  }
}

// 检查with使用
function checkWithUsage(content, filePath) {
  const withRegex = /with\s*\(/g;
  let match;

  while ((match = withRegex.exec(content)) !== null) {
    console.error(`[ERROR] ${filePath}: With statement found`);
    errorCount++;
  }
}

// 检查无用的字符串连接
function checkUselessConcat(content, filePath) {
  const concatRegex = /['"]([^'"]*)['"]\s*\+\s*['"]([^'"]*)['"]/g;
  let match;

  while ((match = concatRegex.exec(content)) !== null) {
    console.warn(
      `[WARNING] ${filePath}: Useless string concatenation found: ${match[0]}`
    );
    warningCount++;
  }
}

// 检查无用的return语句
function checkUselessReturn(content, filePath) {
  const returnRegex = /return\s*;/g;
  let match;

  while ((match = returnRegex.exec(content)) !== null) {
    console.warn(`[WARNING] ${filePath}: Useless return statement found`);
    warningCount++;
  }
}

// 检查重复导入
function checkDuplicateImports(content, filePath) {
  const importRegex = /import\s+.*?from\s+['"](.*?)['"]/g;
  const imports = new Map();
  let match;

  while ((match = importRegex.exec(content)) !== null) {
    const modulePath = match[1];
    const count = imports.get(modulePath) || 0;
    imports.set(modulePath, count + 1);
  }

  imports.forEach((count, modulePath) => {
    if (count > 1) {
      console.error(
        `[ERROR] ${filePath}: Duplicate import found for '${modulePath}'`
      );
      errorCount++;
    }
  });
}

// 检查代码复杂度
function checkComplexity(content, filePath, maxComplexity) {
  const complexityRegex = /\b(if|else|for|while|switch|case|&&|\|\|)\b/g;
  const matches = content.match(complexityRegex) || [];
  const complexity = matches.length;

  if (complexity > maxComplexity) {
    console.warn(`[WARNING] ${filePath}: High complexity (${complexity})`);
    warningCount++;
  }
}

// 检查文件长度
function checkMaxLines(content, filePath, maxLines) {
  const lines = content.split('\n').length;

  if (lines > maxLines) {
    console.warn(`[WARNING] ${filePath}: File too long (${lines} lines)`);
    warningCount++;
  }
}

// 检查Vue未使用的组件
function checkVueUnusedComponents(content, filePath) {
  // 简单检查：从template中提取使用的组件，从script中提取导入的组件
  const templateRegex = /<([A-Z][a-zA-Z0-9]*)[\s/>]/g;
  const importRegex = /import\s+([A-Z][a-zA-Z0-9]*)\s+from\s+['"](.*?)['"]/g;

  const usedComponents = new Set();
  let match;

  while ((match = templateRegex.exec(content)) !== null) {
    usedComponents.add(match[1]);
  }

  const importedComponents = new Set();
  while ((match = importRegex.exec(content)) !== null) {
    if (match[1][0] === match[1][0].toUpperCase()) {
      importedComponents.add(match[1]);
    }
  }

  importedComponents.forEach((component) => {
    if (!usedComponents.has(component)) {
      console.warn(
        `[WARNING] ${filePath}: Unused Vue component '${component}'`
      );
      warningCount++;
    }
  });
}

// 检查Vue重复属性
function checkVueDuplicateAttributes(content, filePath) {
  // 简单检查：在Vue模板中查找重复的属性
  const tagRegex = /<([a-zA-Z][a-zA-Z0-9]*)\s+([^>]*?)>/g;
  let match;

  while ((match = tagRegex.exec(content)) !== null) {
    const attributes = match[2];
    const attrRegex = /\b([a-zA-Z][a-zA-Z0-9-]*)\s*=/g;
    const attrNames = [];
    let attrMatch;

    while ((attrMatch = attrRegex.exec(attributes)) !== null) {
      attrNames.push(attrMatch[1]);
    }

    // 检查重复属性
    const seenAttrs = new Set();
    for (const attr of attrNames) {
      if (seenAttrs.has(attr)) {
        console.error(
          `[ERROR] ${filePath}: Duplicate attribute '${attr}' found`
        );
        errorCount++;
      } else {
        seenAttrs.add(attr);
      }
    }
  }
}

// 运行审查
function runAudit(options) {
  console.log('Starting code audit...');
  console.log('=====================');

  // 重置计数
  errorCount = 0;
  warningCount = 0;

  // 加载配置
  const config = loadConfig(options.config);

  // 扫描目录
  scanDirectory(options.directory, config);

  console.log('=====================');
  console.log(
    `Audit completed with ${errorCount} errors and ${warningCount} warnings`
  );

  if (errorCount > 0) {
    process.exit(1);
  }
}

// 导出模块
module.exports = {
  runAudit,
  loadConfig,
  scanDirectory,
  analyzeFile,
};
