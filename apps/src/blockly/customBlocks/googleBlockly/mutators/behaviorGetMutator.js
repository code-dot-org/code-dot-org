import {commonFunctions} from './commonProcedureCallerMutator';
import GoogleBlockly from 'blockly/core';

export const behaviorGetMutator = {
  previousEnabledState_: true,

  paramsFromSerializedState_: [],

  domToMutation: function (element) {
    const name = element.nextElementSibling.textContent;
    this.behaviorId = element.nextElementSibling.getAttribute('id');
    this.deserialize_(name, []);
  },

  // Only used to save in XML, but still required to exist by Blockly.
  mutationToDom: function () {
    const container = GoogleBlockly.utils.xml.createElement('mutation');
    container.setAttribute('behaviorId', this.behaviorId);
    return container;
  },

  ...commonFunctions,
};
