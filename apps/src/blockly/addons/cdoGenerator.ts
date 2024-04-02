import {BlocklyWrapperType, ExtendedBlock} from '@cdo/apps/blockly/types';
import {Block} from 'blockly';

export default function initializeGenerator(
  blocklyWrapper: BlocklyWrapperType
) {
  blocklyWrapper.JavaScript.translateVarName = function (name: string) {
    return Blockly.JavaScript.nameDB_.getName(
      name,
      Blockly.VARIABLE_CATEGORY_NAME
    );
  };

  // This function was a custom addition in CDO Blockly, so we need to add it here
  // so that our code generation logic still works with Google Blockly
  blocklyWrapper.Generator.xmlToBlocks = function (_name, xml) {
    const div = document.createElement('div');
    const workspace = blocklyWrapper.createEmbeddedWorkspace(div, xml, {});
    return workspace.getTopBlocks(true);
  };

  // This function was a custom addition in CDO Blockly, so we need to add it here
  // so that our code generation logic still works with Google Blockly
  blocklyWrapper.Generator.blockSpaceToCode = function (name) {
    let blocksToGenerate = blocklyWrapper.mainBlockSpace.getTopBlocks(
      true /* ordered */
    );
    return blocklyWrapper.Generator.blocksToCode(name, blocksToGenerate);
  };

  // Used to generate code for an array of top blocks.
  blocklyWrapper.Generator.blocksToCode = function (
    name: string,
    blocksToGenerate: Block[]
  ) {
    if (name !== 'JavaScript') {
      console.warn(
        `Can only generate code in JavaScript. ${name} is unsupported.`
      );
    }
    const generator = blocklyWrapper.getGenerator();
    generator.init(blocklyWrapper.getMainWorkspace());
    const code: string[] = [];
    blocksToGenerate.forEach(block => {
      code.push(blocklyWrapper.JavaScript.blockToCode(block));
    });
    let result = code.join('\n');
    result = generator.finish(result);
    return result;
  };

  const originalBlockToCode = blocklyWrapper.Generator.prototype.blockToCode;
  blocklyWrapper.Generator.prototype.blockToCode = function (
    block: Block | null,
    opt_thisOnly?: boolean
  ) {
    // Skip disabled block check for non-rendered workspaces. Non-rendered workspaces
    // do not have an unused concept.
    if (block?.workspace?.rendered && !block?.isEnabled()) {
      return '';
    }
    return originalBlockToCode.call(
      this,
      block,
      (block as ExtendedBlock)?.skipNextBlockGeneration || opt_thisOnly
    );
  };

  blocklyWrapper.Generator.prefixLines = function (text, prefix) {
    return blocklyWrapper.JavaScript.prefixLines(text, prefix);
  };
}
