module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  parser: "vue-eslint-parser",
  extends: [
    "plugin:vue/vue3-essential", // 使用vue3版本
    "standard",
    "@vue/typescript/recommended",
    "@vue/prettier",
    "@vue/prettier/@typescript-eslint", // 注意顺序
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
  },
  plugins: ["vue"],
  rules: {
    // 'vue/multi-word-component-names': 'off',
    "import/no-extraneous-dependencies": "off",
    "vue/require-default-prop": "off",
    // 'import/no-unresolved': 'off',
    // 'import/no-duplicates': 'off',
  },
};
