#!/usr/bin/env node

/**
 * 代码审查工具命令行入口
 */

import { runAudit } from '../lib/index.js';

// 解析命令行参数
const args = process.argv.slice(2);
const options = {
  directory: args[0] || process.cwd(),
  config: args.find((arg) => arg.startsWith('--config=')?.split('=')[1]),
  quiet: args.includes('--quiet'),
  fix: args.includes('--fix'),
};

// 运行代码审查
runAudit(options);
