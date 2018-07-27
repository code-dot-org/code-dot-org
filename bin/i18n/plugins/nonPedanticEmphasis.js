let originalTokenizer;

module.exports = function nonPedanticEmphasis() {
  const Parser = this.Parser;
  const tokenizers = Parser.prototype.inlineTokenizers;
  const methods = Parser.prototype.inlineMethods;

  originalTokenizer = tokenizers.emphasis;
  tokenizeNonPedanticEmphasis.locator = tokenizers.emphasis.locator;
  tokenizers.nonPedanticEmphasis = tokenizeNonPedanticEmphasis;

  methods.splice(methods.indexOf('emphasis'), 1, 'nonPedanticEmphasis');
};

function tokenizeNonPedanticEmphasis(eat, value, silent) {
  const oldSetting = this.options.pedantic;
  this.options.pedantic = false;

  const result = originalTokenizer.call(this, eat, value, silent);

  this.options.pedantic = oldSetting;
  return result;
}
