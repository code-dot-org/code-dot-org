module.exports = {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-standard-scss',
    'stylelint-config-prettier-scss'
  ],
  rules: {
    'no-descending-specificity': null,
    'rule-empty-line-before': null,
    'selector-class-pattern': null,
    'length-zero-no-unit': null,
    'selector-id-pattern': null,
    'property-no-vendor-prefix': null,
    'declaration-empty-line-before': null,
    'scss/at-mixin-argumentless-call-parentheses': null,
    'scss/dollar-variable-pattern': null,
    'scss/at-import-partial-extension': null,
    'shorthand-property-no-redundant-values': null,
    'color-function-notation': null,
    'scss/double-slash-comment-whitespace-inside': null,
    'value-no-vendor-prefix': null,
    'alpha-value-notation': null,
    'scss/double-slash-comment-empty-line-before': null,
    'selector-pseudo-element-colon-notation': null,
    'declaration-block-no-redundant-longhand-properties': null,
    'selector-no-vendor-prefix': null,
    'value-keyword-case': {camelCaseSvgKeywords: true},
    'function-name-case': {ignoreFunctions: ['/^progid.*$/']}
  }
};
