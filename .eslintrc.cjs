/* eslint-env node */
module.exports = {
  env: {
    browser: true,
    node: true,
    jest: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:unicorn/recommended",
    "plugin:@typescript-eslint/recommended-type-checked",
    "plugin:import/typescript",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.test.json",
    tsconfigRootDir: __dirname,
  },
  plugins: ["@typescript-eslint"],
  root: true,
  settings: {
    "import/resolver": {
      typescript: true,
      node: true,
    },
  },
  overrides: [
    {
      files: ["__tests__/**", "__mocks__/**", "./jest.setup.ts"],
      plugins: ["jest"],
      extends: ["plugin:jest/recommended"],
      rules: {
        "@typescript-eslint/no-unsafe-call": "off",
        "@typescript-eslint/no-unsafe-member-access": "off",
        "@typescript-eslint/no-unsafe-assignment": "off",
        "@typescript-eslint/ban-ts-comment": "off",
        "@typescript-eslint/no-unsafe-return": "off",
      },
    },
  ],
  rules: {
    "@typescript-eslint/no-unused-vars": ["error", { args: "none" }],
    "unicorn/prevent-abbreviations": "off",
    "unicorn/prefer-module": "off",
    "unicorn/filename-case": "off",
  },
};
