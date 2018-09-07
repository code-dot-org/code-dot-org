/**
 * "Expandable Images" are simply images we want to include as thumbnails, which
 * will pop out into a modal when clicked on. The trigger for an image to be
 * treated as expandable is if the image's alt text ends with the string
 * "expandable".
 *
 * See https://github.com/code-dot-org/code-dot-org/pull/16676 for original
 * implementation.
 */
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
