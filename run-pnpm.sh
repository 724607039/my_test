#!/bin/bash

# 确保在正确的项目目录中执行pnpm命令
cd "$(dirname "$0")"

echo "当前工作目录: $(pwd)"
echo "执行命令: pnpm $@"

# 执行pnpm命令
pnpm "$@"
