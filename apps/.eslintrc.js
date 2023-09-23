// This config defines globals available especially in apps,
// enables es6, and enables apps-specific plugins and rules.
// See the root .eslintrc.js for generic eslint linting rules.

// const import_error = 2; // import plugin uses numbers for warning/error

module.exports = {
  parser: '@babel/eslint-parser',
  plugins: [
    'babel',
    'cdo-custom-rules',
    'import',
    'mocha',
    'react-hooks',
    'react',
  ],
  parserOptions: {
    babelOptions: {
      presets: ['@babel/preset-react'],
    },
  },
  extends: [
    'plugin:import/errors',
    // TODO: fix over 9000 warnings and enable this
    // 'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:prettier/recommended',
    'plugin:react/recommended',
  ],
  env: {
    es6: true,
  },
  globals: {
    $: 'readonly',
    ace: 'readonly',
    addToHome: 'readonly',
    adjustScroll: 'readonly',
    Applab: 'readonly',
    appOptions: 'readonly',
    Blockly: 'readonly',
    Bounce: 'readonly',
    Calc: 'readonly',
    CanvasPixelArray: 'readonly',
    CDOSounds: 'readonly',
    censusErrorMessage: 'readonly',
    Craft: 'readonly',
    dashboard: 'readonly',
    Dialog: 'readonly',
    droplet: 'readonly',
    Eval: 'readonly',
    Flappy: 'readonly',
    ga: 'readonly',
    gtag: 'readonly',
    Gamelab: 'readonly',
    google: 'readonly',
    Handsontable: 'readonly',
    hocYear: 'readonly',
    IN_STORYBOOK: 'readonly',
    IN_UNIT_TEST: 'readonly',
    inlineAttach: 'readonly',
    Jigsaw: 'readonly',
    jQuery: 'readonly',
    MapboxGeocoder: 'readonly',
    mapboxgl: 'readonly',
    Maze: 'readonly',
    options: 'readonly',
    p5: 'readonly',
    Phaser: 'readonly',
    // PISKEL_DEVELOPMENT_MODE is a build flag.  See Gruntfile.js for how to enable it.
    PISKEL_DEVELOPMENT_MODE: 'readonly',
    requirejs: 'readonly',
    SerialPort: 'readonly',
    signupErrorMessage: 'readonly',
    Studio: 'readonly',
    thanksUrl: 'readonly',
    Turtle: 'readonly',
    YT: 'readonly',
  },
  rules: {
    'babel/semi': 'error', // autofixable
    'cdo-custom-rules/style-blocks-below-class': 'error',
    // 'import/no-amd': import_error,
    // 'import/no-commonjs': import_error,
    // 'import/no-import-module-exports': import_error,
    // 'import/unambiguous': import_error,
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
    // Load module import aliases like `@cdo/apps` from webpack config
    'import/resolver': {
      typescript: true,
      webpack: true,
    },
    'import/core-modules': [
      // Ignore `No default export found in imported module "blockly/core"` errors
      'blockly/core',
      'blockly/msg/en',
    ],
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
