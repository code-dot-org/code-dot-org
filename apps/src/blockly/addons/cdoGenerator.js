export default function initializeGenerator(blocklyWrapper) {
  blocklyWrapper.JavaScript.translateVarName = function (name) {
    return Blockly.JavaScript.nameDB_.getName(
      name,
      Blockly.VARIABLE_CATEGORY_NAME
    );
  };

  // This function was a custom addition in CDO Blockly, so we need to add it here
  // so that our code generation logic still works with Google Blockly
  blocklyWrapper.Generator.blockSpaceToCode = function (name, opt_typeFilter) {
    const generator = blocklyWrapper.getGenerator();
    generator.init(blocklyWrapper.mainBlockSpace);
    let blocksToGenerate = blocklyWrapper.mainBlockSpace.getTopBlocks(
      true /* ordered */
    );
    if (opt_typeFilter) {
      if (typeof opt_typeFilter === 'string') {
        opt_typeFilter = [opt_typeFilter];
      }
      blocksToGenerate = blocksToGenerate.filter(block =>
        opt_typeFilter.includes(block.type)
      );
    }
    let code = [];
    blocksToGenerate.forEach(block => {
      code.push(blocklyWrapper.JavaScript.blockToCode(block));
    });
    code = code.join('\n');
    code = generator.finish(code);
    return code;
  };

  const originalBlockToCode = blocklyWrapper.Generator.prototype.blockToCode;
  blocklyWrapper.Generator.prototype.blockToCode = function (
    block,
    opt_thisOnly
  ) {
    // Skip unused check for non-rendered workspaces. Non-rendered workspaces
    // do not have an unused concept.
    if (block?.workspace?.rendered && block?.isUnused()) {
      return '';
    }
    return originalBlockToCode.call(
      this,
      block,
      block?.skipNextBlockGeneration || opt_thisOnly
    );
  };

  blocklyWrapper.Generator.prefixLines = function (text, prefix) {
    return blocklyWrapper.JavaScript.prefixLines(text, prefix);
  };
}
