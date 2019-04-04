/**
 * Simple plugin to make remark parsing behave similarly to marked for
 * linebreaks. Specifically, marked does not support line breaks of the format
 * `\\n`, only of the format `  \n`, but remark when in commonmark mode (which
 * is the version that is generally closest to what we want) will always
 * serialize to the former.
 *
 * This plugin simply forces the linebreak serialization to always behave as if
 * it were in non-commonmark mode.
 *
 * Eventually, when we use remark (or anything else that can handle `\\n` line
 * breaks) for rendering our content, we can get rid of this plugin.
 *
 * @see https://github.com/remarkjs/remark/blob/02297a5dea290751a0bfd766b4154ad403307b7e/packages/remark-stringify/lib/visitors/break.js#L5-L9
 */
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
