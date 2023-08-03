module.exports = {
  ignoreFiles: ['./build/**/*.scss', './storybook-deploy/*'],
  extends: ['stylelint-config-standard', 'stylelint-config-standard-scss'],
  rules: {
    'media-feature-range-notation': 'prefix',
    'no-descending-specificity': null,
    'rule-empty-line-before': null,
    'selector-class-pattern': null,
    'selector-id-pattern': null,
    'property-no-vendor-prefix': null,
    'declaration-empty-line-before': null,
    'scss/at-import-partial-extension': null,
    'shorthand-property-no-redundant-values': null,
    'scss/double-slash-comment-whitespace-inside': null,
    'value-no-vendor-prefix': null,
    'alpha-value-notation': null,
    'scss/double-slash-comment-empty-line-before': null,
    'selector-pseudo-element-colon-notation': null,
    'declaration-block-no-redundant-longhand-properties': null,
    'value-keyword-case': null,
    'function-name-case': null,
    'scss/no-global-function-names': null,
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['export'],
      },
    ],
    'property-no-unknown': [
      true,
      {
        ignoreSelectors: [':export'],
      },
    ],
    'property-case': [
      'lower',
      {
        ignoreSelectors: [':export'],
      },
    ],
  },
};
