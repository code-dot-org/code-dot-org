let redact;

const BLOCKFIELD_RE = /^{([^}]+)}/;
const BLOCKFIELD = 'blockfield';

module.exports = function blockfield() {
  if (this.Parser) {
    const Parser = this.Parser;
    redact = Parser.prototype.options.redact;
    Parser.prototype.inlineTokenizers[BLOCKFIELD] = tokenizeResourcelink;

    Parser.prototype.restorationMethods[BLOCKFIELD] = function (add, node) {
      return add({
        type: 'rawtext',
        value: `{${node.slug}}`
      });
    };

    // Run it just before `html`.
    const methods = Parser.prototype.inlineMethods;
    methods.splice(methods.indexOf('html'), 0, BLOCKFIELD);
  }
};

tokenizeResourcelink.notInLink = true;
tokenizeResourcelink.locator = locateResourcelink;

function tokenizeResourcelink(eat, value, silent) {
  const match = BLOCKFIELD_RE.exec(value);

  // Custom block fields are ONLY supported in redaction mode.
  if (match && redact) {
    if (silent) {
      return true;
    }

    const slug = match[1];
    return eat(match[0])({
      type: 'redaction',
      redactionType: BLOCKFIELD,
      slug,
      children: [{
        type: 'text',
        value: slug
      }]
    });
  }
}

function locateResourcelink(value, fromIndex) {
  return value.indexOf("{", fromIndex);
}
