module.exports = function nonCommonmarkLinebreak() {
  if (this.Compiler) {
    const Compiler = this.Compiler;
    const visitors = Compiler.prototype.visitors;
    const originalVisitor = visitors['break'];

    visitors['break'] = function lineBreak(node) {
      const oldSetting = this.options.commonmark;
      this.options.commonmark = false;

      const result = originalVisitor.call(this, node);

      this.options.commonmark = oldSetting;
      return result;
    };
  }
};
