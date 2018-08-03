let originalTokenizer;

/**
 * Simple plugin to make remark parsing behave similarly to marked for emphasis.
 * Specifically, marked is relatively flexible with situations in which it does
 * and does not recognize emphasis. Examples include spaces between the markers
 * and the string (`* content *`) and various ways of nesting emphases
 * (`_*content*_`, etc).
 *
 * Remark generally recognizes those, but only when not in pedantic mode.
 * Unfortunately, we specifically want to run remark in pedantic mode to support
 * other, more complex differences (like nested lists). So, this plugin simply
 * forces remark to behave nonpedantically for emphases.
 *
 * Eventually, when we use remark for rendering our content, or are able to use
 * redaction and restoration in non-pedantic mode, we can get rid of this
 * plugin.
 */
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
