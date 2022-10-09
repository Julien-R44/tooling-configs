module.exports = {
  extends: ['plugin:react/recommended', 'plugin:react-hooks/recommended', '@julr/eslint-config-ts'],
  settings: {
    react: {
      version: '17.0',
    },
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
  },
}
