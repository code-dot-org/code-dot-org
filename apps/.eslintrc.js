// There are some rules that we would like to have enabled, but which have
// existing violations that need to be fixed (or individually ignored) before
// we can do so.
//
// Adding them here separately from the other, intentionally-disabled rules
// below, so that we can more easily track fixing violations and eventually
// reenabling.
const rulesToEventuallyReenable = {
  'jsx-a11y/anchor-is-valid': 'off',
  'jsx-a11y/click-events-have-key-events': 'off',
  'jsx-a11y/label-has-associated-control': 'off',
  'jsx-a11y/mouse-events-have-key-events': 'off',
  'jsx-a11y/no-noninteractive-element-interactions': 'off',
  'jsx-a11y/no-static-element-interactions': 'off',
  'jsx-a11y/tabindex-no-positive': 'off',
};

const accessibilityTestingMessage =
  'Tests should resemble how the user interacts with the application and should not rely on technical details, see docs https://testing-library.com/docs/queries/about/#priority and playbook https://docs.google.com/document/d/1U4MRbH1kthYn40mbAFK59fOWWJNcvrMIDpAZzYd9q9Y/edit';

const noDataTestIdMessage =
  'Attribute data-testid does not meet accessibility guidelines. ' +
  accessibilityTestingMessage;

// This config defines globals available especially in apps,
// enables es6, and enables apps-specific plugins and rules.
// See the root .eslintrc.js for generic eslint linting rules.
module.exports = {
  parser: '@babel/eslint-parser',
  plugins: [
    'cdo-custom-rules',
    'react',
    'react-hooks',
    'mocha',
    'babel',
    'jsx-a11y',
    'storybook',
    'import',
    'jest',
  ],
  parserOptions: {
    babelOptions: {
      presets: ['@babel/preset-react'],
    },
  },
  extends: [
    'plugin:react/recommended',
    'plugin:prettier/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:storybook/recommended',
  ],
  env: {
    es6: true,
    'jest/globals': true,
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
    // Only used in Web Lab 2.
    stylelint: 'readonly',
    thanksUrl: 'readonly',
    Turtle: 'readonly',
    YT: 'readonly',
  },
  reportUnusedDisableDirectives: true,
  rules: {
    ...rulesToEventuallyReenable,
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
    'import/no-duplicates': 'error',
    'import/order': [
      'error',
      {
        'newlines-between': 'always',
        groups: [
          ['builtin', 'external'],
          'internal',
          'parent',
          'sibling',
          'index',
        ],
        pathGroups: [
          {
            pattern: '*.scss',
            group: 'index',
            position: 'after',
            patternOptions: {matchBase: true},
          },
          {
            pattern: '@cdo/**',
            group: 'internal',
            position: 'before',
          },
        ],
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
        pathGroupsExcludedImportTypes: ['builtin', 'object'],
      },
    ],
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: 'chai',
            message: 'Use jest matchers instead of chai',
          },
          {
            // We are deprecating enzyme in favor of react-testing-library. See further work at https://docs.google.com/document/d/1eX-LV7d2GtuAypy9BYiT5HOwu7FQjc4kVu6qx_6bDiI
            name: 'enzyme',
            message: 'Use react-testing-library instead of enzyme',
          },
          {
            // In Feb 2022, we voted to deprecate Radium (proposal at https://docs.google.com/document/d/1Y3uK_iYMhTUaCI6yIDwOAMprIJCuzXSs2fECQggwp60/edit#heading=h.htf3pg55q2kt)
            name: 'radium',
            message: 'Use css modules instead of radium',
          },
          {
            // We are now using 'react-bootstrap-2'. See further work at https://github.com/code-dot-org/code-dot-org/pull/51681
            name: 'react-bootstrap',
            message: 'Use react-bootstrap-2 instead of react-bootstrap',
          },
          {
            name: 'react-router',
            message: 'Use react-router-dom instead of react-router',
          },
          {
            name: 'sinon',
            message: 'Use jest spies and stubs instead of sinon',
          },
          {
            name: 'sinon-chai',
            message: 'Use jest matchers instead of chai',
          },
        ],
        patterns: [
          {
            group: ['*deprecatedChai', '*reconfiguredChai'],
            message: 'Use jest matchers instead of chai',
          },
        ],
      },
    ],
    'react/forbid-dom-props': [
      'error',
      {
        forbid: [{propName: 'data-testid', message: noDataTestIdMessage}],
      },
    ],
    'react/forbid-component-props': [
      'error',
      {
        forbid: [{propName: 'data-testid', message: noDataTestIdMessage}],
      },
    ],
  },
  settings: {
    react: {
      version: 'detect',
    },
    'import/extensions': ['.js', '.jsx', '.ts', '.tsx'],
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
        '@typescript-eslint/no-unused-vars': ['error', {args: 'none'}],
        // TODO: We are temporarily disabling this rule to allow using require() to import
        // JavaScript files in TypeScript. Instead, we should add 'allowJs': true to our
        // tsconfig.json file, but this is currently causing some build issues (SL-791)
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
    {
      files: ['*.story.@(ts|tsx|js|jsx)'],
      rules: {
        'storybook/no-title-property-in-meta': 'error',
      },
    },
    {
      files: ['test/unit/**'],
      rules: {
        'no-restricted-properties': [
          'error',
          {
            object: 'screen',
            property: 'getByTestId',
            message: accessibilityTestingMessage,
          },
          {
            object: 'screen',
            property: 'queryByTestId',
            message: accessibilityTestingMessage,
          },
          {
            object: 'screen',
            property: 'getAllByTestId',
            message: accessibilityTestingMessage,
          },
          {
            object: 'screen',
            property: 'queryAllByTestId',
            message: accessibilityTestingMessage,
          },
          {
            object: 'screen',
            property: 'findByTestId',
            message: accessibilityTestingMessage,
          },
          {
            object: 'screen',
            property: 'findAllByTestId',
            message: accessibilityTestingMessage,
          },
          {
            object: 'container',
            property: 'querySelector',
            message: accessibilityTestingMessage,
          },
          {
            object: 'container',
            property: 'querySelectorAll',
            message: accessibilityTestingMessage,
          },
          {
            property: 'toHaveClass',
            message: accessibilityTestingMessage,
          },
        ],
      },
    },
  ],
};
