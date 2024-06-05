// This is a copied version of blockly's procedureCallerMutator.
// The only change is in saveExtraState (imported from commonFunctions).
// This change loads the name from the field value if the procedure model
// is not found.

// Blockly is fixing this issue, so we should be able to remove this file
// once we upgrade to Blockly v10.
import {ProcedureBlock} from '@cdo/apps/blockly/types';

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
  mutationToDom: function (this: ProcedureBlock) {
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
  domToMutation: function (this: ProcedureBlock, xmlElement: Element) {
    const name = xmlElement.getAttribute('name') || '';
    const params: string[] = [];
    const childNodes = Array.from(xmlElement.childNodes) as Element[];
    for (const n of childNodes) {
      const nameAttribute = n.getAttribute('name');
      if (n.nodeName.toLowerCase() === 'arg' && nameAttribute) {
        params.push(nameAttribute);
      }
    }
    this.deserialize_(name, params);
  },

  ...commonFunctions,
};

export default procedureCallerMutator;
