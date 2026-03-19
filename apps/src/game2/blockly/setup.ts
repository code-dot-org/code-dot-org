import {dynamicBlocks, jsonBlocks} from './blockDefinitions';

let isSetup = false;

export function setupGame2BlocklyEnvironment() {
  if (isSetup) {
    return;
  }

  for (const {type, register, generator, extendedOptions} of dynamicBlocks) {
    register();
    if (extendedOptions) {
      Object.assign(Blockly.Blocks[type], extendedOptions);
    }
    Blockly.getGenerator().forBlock[type] = generator;
  }

  for (const {definition, generator, extendedOptions} of jsonBlocks) {
    Blockly.Blocks[definition.type] = {
      init: function () {
        this.jsonInit(definition);
      },
      ...extendedOptions,
    };
    Blockly.getGenerator().forBlock[definition.type] = generator;
  }

  isSetup = true;
}
