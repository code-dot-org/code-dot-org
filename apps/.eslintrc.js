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
      rules: {
        'import/order': 'off',
      },
      // We are actively working to decrease the number of folders in this list.
      // To turn on the order rule for a folder, remove it from this list and run `yarn lint --fix`
      // Commit any changes made.
      files: [
        'src/*',
        'src/acemode/*',
        'src/aichat/**',
        'src/ailab/*',
        'src/aiTutor/**',
        'src/applab/**',
        'src/assetManagement/*',
        'src/blockTooltips/*',
        'src/bounce/*',
        'src/calc/*',
        'src/code-studio/**',
        'src/cookieBanner/*',
        'src/courseExplorer/*',
        'src/dance/**',
        'src/eval/*',
        'src/fish/*',
        'src/flappy/*',
        'src/generated/**',
        'src/hamburger/*',
        'src/javalab/**',
        'src/lab2/**',
        'src/lib/**',
        'src/music/**',
        'src/musicMenu/*',
        'src/p5lab/**',
        'src/panels/*',
        'src/publicKeyCryptography/*',
        'src/pythonlab/*',
        'src/redux/*',
        'src/regionalPartnerMiniContact/*',
        'src/sites/**',
        'src/standaloneVideo/*',
        'src/storage/**',
        // This one had some problems, see https://github.com/code-dot-org/code-dot-org/pull/58284
        'src/templates/curriculumCatalog/**',
        'src/templates/policy_compliance/**',
        'src/templates/progress/**',
        'src/templates/projects/**',
        'src/templates/referenceGuides/**',
        'src/templates/rubrics/**',
        'src/templates/sessions/**',
        'src/templates/verificationPages/**',
        'src/templates/*',
        'src/third-party/*',
        'src/types/*',
        'src/userHeaderEventLogger/*',
        'src/util/**',
        'src/weblab/**',
        'src/weblab2/*',
        'test/integration/**',
        'test/*',
        'test/unit/*',
        'test/unit/applab/**',
        'test/unit/assetManagement/**',
        'test/unit/blockTooltips/**',
        'test/unit/calc/**',
        'test/unit/code-studio/**',
        'test/unit/dance/**',
        'test/unit/gamelab/**',
        'test/unit/javalab/**',
        'test/unit/lab2/**',
        'test/unit/lib/**',
        'test/unit/lib/kits/**',
        'test/unit/lib/levelbuilder/**',
        'test/unit/music/**',
        'test/unit/p5lab/**',
        'test/unit/redux/**',
        'test/unit/sites/**',
        'test/unit/storage/**',
        'test/unit/weblab/**',
      ],
    },
  ],
};
