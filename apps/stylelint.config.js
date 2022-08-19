module.exports = {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-standard-scss',
    'stylelint-config-prettier-scss'
  ],
  rules: {
    // Use lowerCamelCase for classNames and ids because of their use in JS files
    // This convention is recommended by the maintainers of css-modules:
    // https://github.com/css-modules/css-modules#naming
    'selector-class-pattern': '^[a-z][a-zA-Z0-9]+$',
    'selector-id-pattern': null,

    // The goal is to enable all of the following rules
    'no-descending-specificity': null,
    'rule-empty-line-before': null,
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
    'scss/no-global-function-names': null
  }
};
