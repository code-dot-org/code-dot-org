import {commonFunctions} from './commonProcedureCallerMutator';

export const behaviorGetMutator = {
  previousEnabledState_: true,

  paramsFromSerializedState_: [],

  domToMutation: function (element) {
    const name = element.nextElementSibling.textContent;
    this.behaviorId = element.nextElementSibling.getAttribute('id');
    this.deserialize_(name, []);
  },

  // Only used to save in XML, but still required to exist by Blockly.
  mutationToDom: function () {},

  ...commonFunctions,
};
