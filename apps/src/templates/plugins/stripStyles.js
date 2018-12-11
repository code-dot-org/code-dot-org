/**
 * Refuse to render style tags.
 *
 * Note that once we settle on a final compiler, we should be able to actually
 * write this as a plugin that modifies the way the compiler works (rather than
 * one that just sits on the "out" pipe of the compiler and monitors results) in
 * order to really efficiently support rendering just a strict whitelist of HTML
 * tags.
 */
module.exports = function stripStyles() {
  const visitors = this.Compiler.prototype.visitors;
  const originalHtml = visitors.html;
  visitors.html = function (node, parent) {
    const originalResult = originalHtml.call(this, node, parent);
    return originalResult.indexOf('<style>') !== -1 ? '' : originalResult;
  };
};
