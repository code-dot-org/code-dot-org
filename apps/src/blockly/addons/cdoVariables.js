export default function initializeVariables(blocklyWrapper) {
  // TODO - required for sprite variable blocks
  blocklyWrapper.Variables.registerGetter = function(category, blockName) {};

  // TODO - required for all variable blocks
  blocklyWrapper.Variables.getVars = function(opt_category) {
    return {};
  };
}
