export default function initializeVariables(blocklyWrapper) {
  blocklyWrapper.Variables.getters = {
    Default: 'variables_get',
  };
  blocklyWrapper.Variables.setters = {
    Default: 'variables_set',
  };

  blocklyWrapper.Variables.registerGetter = function (category, blockName) {
    blocklyWrapper.Variables.getters[category] = blockName;
  };

  blocklyWrapper.Variables.registerSetter = function (category, blockName) {
    blocklyWrapper.Variables.setters[category] = blockName;
  };

  /**
   * Find all the variables used in the provided block.
   * @param {Blockly.Block} block Block to check for variables
   * @returns {string[]} Array of all the variables used.
   */
  blocklyWrapper.Variables.allVariablesFromBlock = function (block) {
    if (!block.getVars) {
      return [];
    }
    var varsByCategory = block.getVars();
    return Object.keys(varsByCategory).reduce(function (vars, category) {
      return vars.concat(varsByCategory[category]);
    }, []);
  };

  /**
   * Standard implementation of getVars for blocks with a single 'VAR' title
   * @param {string=} opt_category Variable category, defaults to 'Default'
   */
  blocklyWrapper.Variables.getVars = function (opt_category) {
    var category = opt_category || blocklyWrapper.Variables.DEFAULT_CATEGORY;
    var vars = {};
    vars[category] = [this.getTitleValue('VAR')];
    return vars;
  };

  /**
   * Return a new variable name that is not yet being used. The CDO implementation
   * of this function accepted a baseName parameter. We are using Google Blockly's
   * implementation here, which does the same thing. It accepts a workspace as an
   * argument, so we ignore the _baseName argument for labs migrated to Google Blockly
   * in favor of pulling the workspace off the associated block.
   * Blockly's implementation can be found here:
   * https://github.com/google/blockly/blob/45cc1e8feaebdc90792e56faf6f0d8364df024e6/core/variables.ts#L169
   * CDO implementation can be found here:
   * https://github.com/code-dot-org/blockly/blob/f012d8262f21bae3e54fb11dd8bc29cf0d29f3cd/core/utils/variables.js#L259

   * @param {string} _baseName Ignored/for backwards compatibility only; the
   *   base name to use when generating a unique name.
   * @param {Blockly.Block} block Block from which to pull the current workspace.
   * @return {string} New variable name.
   */
  const originalGenerateUniqueName =
    blocklyWrapper.Variables.generateUniqueName; // Core Blockly function is originally stored here and then gets overwritten
  blocklyWrapper.Variables.generateUniqueName = function (
    _baseName = null,
    block
  ) {
    const workspace = block.workspace;
    return originalGenerateUniqueName.call(this, workspace);
  };
}
