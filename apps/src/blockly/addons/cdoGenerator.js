export default function initializeGenerator(blocklyWrapper) {
  // This function was a custom addition in CDO Blockly, so we need to add it here
  // so that our code generation logic still works with Google Blockly
  blocklyWrapper.Generator.blockSpaceToCode = function(name, opt_typeFilter) {
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

  blocklyWrapper.Generator.prefixLines = function(text, prefix) {
    return blocklyWrapper.JavaScript.prefixLines(text, prefix);
  };
}
