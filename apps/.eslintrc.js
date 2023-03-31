// This config only defines globals available especially in apps,
// and enables es6. See the root .eslintrc.js for linting rules.
module.exports = {
  parser: '@babel/eslint-parser',
  plugins: ['cdo-custom-rules'],
  parserOptions: {
    babelOptions: {
      presets: ['@babel/preset-react']
    }
  },
  extends: ['plugin:prettier/recommended'],
  env: {
    es6: true
  },
  globals: {
    Blockly: true,
    Phaser: true,
    Studio: true,
    Maze: true,
    Turtle: true,
    Bounce: true,
    Eval: true,
    Flappy: true,
    Applab: true,
    Calc: true,
    Jigsaw: true,
    $: true,
    jQuery: true,
    IN_UNIT_TEST: true,
    IN_STORYBOOK: true
  },
  rules: {
    'cdo-custom-rules/style-blocks-below-class': 'error'
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      extends: ['plugin:@typescript-eslint/recommended'],
      rules: {
        // We can rely on typescript types instead of prop types
        'react/prop-types': 'off',
        // We need to fix up our imports
        // https://codedotorg.atlassian.net/browse/SL-763
        '@typescript-eslint/no-var-requires': 'off',
        // TODO: should this be an error?
        '@typescript-eslint/no-explicit-any': 'off'
      }
    }
  ]
};
