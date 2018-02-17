module.exports = {
  root: true,
  parserOptions: {
    parser: 'babel-eslint',
    ecmaVersion: 2017,
    sourceType: 'module',
  },
  env: {
    node: true,
    es6: true,
  },
  extends: ['standard'],
  plugins: [],
  rules: {
    'space-before-function-paren': [
      'error',
      {
        anonymous: 'never',
        named: 'never',
        asyncArrow: 'always',
      },
    ],
    'comma-dangle': ['error', 'always-multiline'],
    semi: ['error', 'always'],
  },
  globals: {},
};
