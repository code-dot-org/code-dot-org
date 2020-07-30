import Blockly from '@code-dot-org/blockly';

const BlocklyWrapper = function(blocklyInstance) {
  this.blockly_ = blocklyInstance;
  this.Msg = blocklyInstance.Msg;
  this.inject = this.blockly_.inject;
  this.wrapProperty = function(propertyName) {
    Object.defineProperty(this, propertyName, {
      get: function() {
        return this.blockly_[propertyName];
      }
    });
  };
};

function initializeBlocklyWrapper() {
  const blocklyWrapper = new BlocklyWrapper(Blockly);
  return blocklyWrapper;
}

window.Blockly = initializeBlocklyWrapper();
