let redact;

const BLOCKLY = 'blockly';

module.exports = function blockly() {
  if (this.Parser) {
    const Parser = this.Parser;
    redact = Parser.prototype.options.redact;

    Parser.prototype.restorationMethods[BLOCKLY] = function(add, node) {
      return add({
        type: 'rawtext',
        value: node.original
      });
    };

    ['inline', 'block'].forEach(type => {
      Parser.prototype[`${type}Tokenizers`][BLOCKLY] = tokenizeBlockly;
      const methods = Parser.prototype[`${type}Methods`];
      methods.splice(methods.indexOf('html'), 0, BLOCKLY);
    });
  }
};

function tokenizeBlockly(eat, value, silent) {
  // This plugin ONLY exists to redact Blockly blocks from translations, not to
  // render anything.
  if (!redact) {
    return false;
  }

  if (!value.startsWith('<xml>')) {
    return false;
  }

  // Search indiscriminately for next closing tag. Note that this precludes
  // situations like:
  //
  // <xml>
  //   <block>
  //     <xml>
  //       <block/>
  //     </xml>
  //   </block>
  // </xml>
  //
  // Because we would match the inner closing tag with the outer opening tag.
  // However, that's not valid XML anyway, so I don't think we care.
  const closingTag = '</xml>';
  const closingIndex = value.indexOf(closingTag);

  if (closingIndex === -1) {
    return false;
  }

  if (silent) {
    return true;
  }

  // Eat to end of closing tag
  const original = value.substring(0, closingIndex + closingTag.length);
  return eat(original)({
    type: 'redaction',
    redactionType: BLOCKLY,
    original,
    children: [
      {
        type: 'text',
        value: 'blockly block'
      }
    ]
  });
}
tokenizeBlockly.notInLink = true;
tokenizeBlockly.locator = locateBlockly;

function locateBlockly(value, fromIndex) {
  return value.indexOf('<', fromIndex);
}
