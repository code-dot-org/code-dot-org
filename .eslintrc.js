// This is the primary JavaScript linting rules for the entire
// project.  In a few places, some of these rules are extended
// or overridden for a particular subset of the project.  See
// other .eslintrc.js files for those rules.
module.exports = {
  extends: ['eslint:recommended', 'plugin:prettier/recommended'],
  env: {
    browser: true,
    node: true,
    mocha: true
  },
  rules: {
    'array-bracket-spacing': ['error', 'never'],
    'brace-style': ['error', '1tbs', {allowSingleLine: true}],
    'comma-dangle': 'off',
    curly: 'error',
    'dot-location': ['error', 'property'],
    'eol-last': 'error',
    eqeqeq: 'error',
    'jsx-quotes': 'error', // autofixable
    'keyword-spacing': 'error',
    'no-array-constructor': 'error',
    'no-console': 'off',
    'no-duplicate-imports': 'error',
    'no-empty': 'off',
    'no-eval': 'error',
    'no-ex-assign': 'off',
    'no-extra-boolean-cast': 'off',
    'no-implicit-globals': 'error',
    'no-new-object': 'error',
    // Turn back to error once we've fixed all the existing warnings
    'no-prototype-builtins': 'off',
    'no-redeclare': ['error', {builtinGlobals: false}],
    'no-restricted-imports': ['error', 'radium'],
    'no-trailing-spaces': 'error',
    'no-undef': 'error',
    'no-unused-vars': ['error', {args: 'none'}],
    'no-useless-escape': 'off',
    'no-with': 'error',
    'object-curly-spacing': 'off',
    semi: 'off', // enforced by babel/semi
    'space-before-blocks': 'error',
    strict: 'error'
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
};
