module.exports = function expandableImages() {
  const Parser = this.Parser;
  const tokenizers = Parser.prototype.inlineTokenizers;
  const originalImage = tokenizers.link;
  tokenizers.link = function (eat, value, silent) {
    const link = originalImage.call(this, eat, value, silent);
    if (link && link.type === "image" && link.alt && link.alt.endsWith("expandable")) {
      link.type = "span";
      link.data = {
        hName: 'span',
        hProperties: {
          dataUrl: link.url,
          className: "expandable-image"
        }
      };
      link.children = [{
        type: 'text',
        value: link.alt.substr(0, -1 * "expandable".length).trim()
      }];
    }

    return link;
  };
  tokenizers.link.locator = originalImage.locator;
};
