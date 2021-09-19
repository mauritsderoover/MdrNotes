module.exports = {
  root: true,

  env: {
    node: true,
  },

  parserOptions: {
    ecmaVersion: 2020,
  },

  rules: {
    "prettier/prettier": [
      "error",
      {
        endOfLine: "auto"
      },
    ],
  },

  extends: [
    "plugin:vue/vue3-recommended",
    "@vue/standard",
    "eslint:recommended",
    "@vue/prettier",
  ],
};
