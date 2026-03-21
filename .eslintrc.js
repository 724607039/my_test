module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es2021: true,
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  plugins: ['vue', '@typescript-eslint', 'prettier', 'unused-imports'],
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'prettier',
  ],
  rules: {
    // 基础规则
    'vue/multi-word-component-names': 'off',
    'vue/no-unused-vars': 'error',
    'vue/require-default-prop': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    'prettier/prettier': 'error',

    // 代码效果审查规则

    // 性能相关
    'no-unused-vars': 'error',
    'unused-imports/no-unused-imports': 'error',
    'no-console': 'warn',
    'no-debugger': 'warn',

    // 代码质量
    'no-eval': 'error',
    'no-with': 'error',
    'no-useless-concat': 'error',
    'no-useless-return': 'error',
    'no-duplicate-imports': 'error',

    // Vue相关
    'vue/no-unused-components': 'error',
    'vue/no-duplicate-attributes': 'error',
    'vue/require-prop-types': 'warn',

    // 样式相关
    'vue/attributes-order': 'warn',
    'vue/html-self-closing': 'off',
    'vue/max-attributes-per-line': 'off',

    // 可维护性
    complexity: [
      'warn',
      {
        max: 10,
      },
    ],
    'max-lines': [
      'warn',
      {
        max: 300,
        skipBlankLines: true,
        skipComments: true,
      },
    ],
  },
};
