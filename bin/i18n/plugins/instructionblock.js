let redact;

const INSTRUCTIONBLOCK = "instructionblock";
const INSTRUCTIONBLOCK_RE = /^<xml><block type="(.+?)".+?<\/block><\/xml>/;

module.exports = function instructionblocks() {
  if (this.Parser) {
    const Parser = this.Parser;
    redact = Parser.prototype.options.redact;
    const tokenizers = Parser.prototype.inlineTokenizers;
    const methods = Parser.prototype.inlineMethods;

    /* Add an inline tokenizer (defined in the following example). */
    tokenizers[INSTRUCTIONBLOCK] = tokenizeInstructionBlock;

    Parser.prototype.restorationMethods[INSTRUCTIONBLOCK] = function(
      add,
      node
    ) {
      return add({
        type: "rawtext",
        value: node.original
      });
    };

    /* Run it just before `html`. */
    methods.splice(methods.indexOf("html"), 0, INSTRUCTIONBLOCK);
  }
};
tokenizeInstructionBlock.notInLink = true;
tokenizeInstructionBlock.locator = locateInstructionBlock;

function tokenizeInstructionBlock(eat, value, silent) {
  const match = INSTRUCTIONBLOCK_RE.exec(value);

  if (match && redact) {
    const add = eat(match[0]);
    const blockType = match[1];
    const original = match[0];

    return add({
      type: "redaction",
      redactionType: "instructionblock",
      blockType,
      original,
      children: [
        {
          type: "text",
          value: blockType
        }
      ]
    });
  }
}

function locateInstructionBlock(value, fromIndex) {
  return value.indexOf("<", fromIndex);
}
