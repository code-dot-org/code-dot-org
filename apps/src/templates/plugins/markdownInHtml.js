import processMarkdown from 'marked';
import renderer from "../../util/StylelessRenderer";

module.exports = function markdownInHtml() {
  const Parser = this.Parser;
  const originalBlockHtml = Parser.prototype.blockTokenizers.html;
  Parser.prototype.blockTokenizers.html = function (eat, value, silent) {
    const html = originalBlockHtml.call(this, eat, value, silent);
    if (html && html.value) {
      html.value = processMarkdown(html.value, { renderer });
    }

    return html;
  };

  const originalInlineHtml = Parser.prototype.inlineTokenizers.html;
  Parser.prototype.inlineTokenizers.html = function (eat, value, silent) {
    const html = originalInlineHtml.call(this, eat, value, silent);
    if (html && html.value) {
      html.value = processMarkdown(html.value, { renderer });
    }

    return html;
  };
  Parser.prototype.inlineTokenizers.html.locator = originalInlineHtml.locator;
};
