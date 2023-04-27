// This config defines globals available especially in apps,
// enables es6, and enables apps-specific plugins and rules.
// See the root .eslintrc.js for generic eslint linting rules.
module.exports = {
  parser: '@babel/eslint-parser',
  plugins: ['cdo-custom-rules', 'react', 'react-hooks', 'mocha', 'babel'],
  parserOptions: {
    babelOptions: {
      presets: ['@babel/preset-react'],
    },
  },
  extends: ['plugin:react/recommended', 'plugin:prettier/recommended'],
  env: {
    es6: true,
  },
  globals: {
    Blockly: 'writeable',
    Phaser: 'writeable',
    Studio: 'writeable',
    Maze: 'writeable',
    Turtle: 'writeable',
    Bounce: 'writeable',
    Eval: 'writeable',
    Flappy: 'writeable',
    Applab: 'writeable',
    Calc: 'writeable',
    Jigsaw: 'writeable',
    $: 'writeable',
    jQuery: 'writeable',
    IN_UNIT_TEST: 'writeable',
    IN_STORYBOOK: 'writeable',
    dashboard: 'writeable',
    ace: 'writeable',
    requirejs: 'writeable',
    appOptions: 'writeable',
    options: 'writeable',
    droplet: 'writeable',
    p5: 'writeable',
    mapboxgl: 'writeable',
    MapboxGeocoder: 'writeable',
    SerialPort: 'writeable',
    Gamelab: 'writeable',
    LEVEL_TYPE: 'writeable',
    CDOSounds: 'writeable',
    ga: 'readonly',
    google: 'readonly',
  },
  rules: {
    'babel/semi': 'error', // autofixable
    'cdo-custom-rules/style-blocks-below-class': 'error',
    'mocha/no-exclusive-tests': 'error',
    'react/button-has-type': 'error',
    'react/display-name': 'off',
    'react/jsx-closing-bracket-location': 'error', // autofixable
    'react/jsx-curly-spacing': 'error', // autofixable
    'react/jsx-first-prop-new-line': ['error', 'multiline'],
    'react/jsx-indent-props': ['error', 2], // autofixable
    'react/jsx-key': 'off',
    'react/jsx-no-target-blank': 'error',
    'react/jsx-wrap-multilines': 'error', // autofixable
    'react/no-find-dom-node': 'off',
    'react/no-render-return-value': 'off',
    'react/no-string-refs': 'off',
    'react/no-unescaped-entities': 'off',
    'react/self-closing-comp': 'error',
    'react/no-danger': 'error',
    'react-hooks/exhaustive-deps': 'error',
    'react-hooks/rules-of-hooks': 'error',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  overrides: [
    {
      // Use the typescript parser for typescript files
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      extends: ['plugin:@typescript-eslint/recommended'],
      rules: {
        // We can rely on typescript types instead of prop types
        'react/prop-types': 'off',
        // TODO: We are temporarily disabling this rule to allow using require() to import
        // JavaScript files in TypeScript. Instead, we should add 'allowJs': true to our
        // tsconfig.json file, but this is currently causing some build issues (SL-791)
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],
};
