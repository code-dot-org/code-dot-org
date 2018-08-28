module.exports = function stripStyles() {
  const visitors = this.Compiler.prototype.visitors;
  const originalHtml = visitors.html;
  visitors.html = function (node, parent) {
    const originalResult = originalHtml.call(this, node, parent);
    return originalResult.indexOf('<style>') !== -1 ? '' : originalResult;
  };
};
