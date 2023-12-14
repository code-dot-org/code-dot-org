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

  // We shouldn't ever need to save behaviors as XML because Sprite Lab also saves to JSON.
  // However, this function would create the appropriate mutation if did.
  mutationToDom: function () {
    const container = GoogleBlockly.utils.xml.createElement('mutation');
    container.setAttribute('behaviorId', this.behaviorId);
    return container;
  },

  ...commonFunctions,
};
