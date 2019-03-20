// https://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parserOptions: {
    parser: '@typescript-eslint/parser'
  },
  env: {
    browser: true,
  },
  // https://github.com/vuejs/eslint-plugin-vue#priority-a-essential-error-prevention
  // consider switching to `plugin:vue/strongly-recommended` or `plugin:vue/recommended` for stricter rules.
  extends: [
    'plugin:vue/recommended',
    'plugin:prettier/recommended',
    'prettier/vue'
  ],
  // required to lint *.vue files
  plugins: [
    'vue',
    "typescript",
    "prettier",
  ],
  // add your custom rules here
  rules: {
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    "vue/html-closing-bracket-spacing": "error",
    "no-trailing-spaces": "error",
    "vue/html-closing-bracket-newline": "off", // TODO: multiline: never
    "vue/attributes-order": "off", // TODO: delete this
    "vue/no-template-shadow": "off" // TODO: delete this
  }
}
