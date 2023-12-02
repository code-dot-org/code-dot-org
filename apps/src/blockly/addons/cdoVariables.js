export default function initializeVariables(blocklyWrapper) {
  blocklyWrapper.Variables.getters = {
    Default: 'variables_get',
  };

  blocklyWrapper.Variables.registerGetter = function (category, blockName) {
    Blockly.Variables.getters[category] = blockName;
  };

  blocklyWrapper.Variables.allVariablesFromBlock = function (block) {
    if (!block.getVars) {
      return [];
    }
    var varsByCategory = block.getVars();
    return Object.keys(varsByCategory).reduce(function (vars, category) {
      return vars.concat(varsByCategory[category]);
    }, []);
  };

  blocklyWrapper.Variables.getVars = function (opt_category) {
    var category = opt_category || Blockly.Variables.DEFAULT_CATEGORY;
    var vars = {};
    vars[category] = [this.getTitleValue('VAR')];
    return vars;
  };
}
