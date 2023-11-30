// This is a copied version of blockly's procedureCallerMutator.
// The only change is in saveExtraState (imported from commonFunctions).
// This change loads the name from the field value if the procedure model
// is not found.

// Blockly is fixing this issue, so we should be able to remove this file
// once we upgrade to Blockly v10.
import {commonFunctions} from './commonProcedureCallerMutator';

const procedureCallerMutator = {
  previousEnabledState_: true,

  paramsFromSerializedState_: [],

  /**
   * Create XML to represent the (non-editable) name and arguments.
   * Backwards compatible serialization implementation.
   * @returns XML storage element.
   * @this {Blockly.Block}
   */
  mutationToDom: function () {
    const container = Blockly.utils.xml.createElement('mutation');
    const model = this.getProcedureModel();
    if (!model) return container;

    container.setAttribute('name', model.getName());
    for (const param of model.getParameters()) {
      const arg = Blockly.utils.xml.createElement('arg');
      arg.setAttribute('name', param.getName());
      container.appendChild(arg);
    }
    return container;
  },

  /**
   * Parse XML to restore the (non-editable) name and parameters.
   * Backwards compatible serialization implementation.
   * @param xmlElement XML storage element.
   * @this {Blockly.Block}
   */
  domToMutation: function (xmlElement) {
    const name = xmlElement.getAttribute('name');
    const params = [];
    for (const n of xmlElement.childNodes) {
      if (n.nodeName.toLowerCase() === 'arg') {
        params.push(n.getAttribute('name'));
      }
    }
    this.deserialize_(name, params);
  },

  ...commonFunctions,
};

export default procedureCallerMutator;
