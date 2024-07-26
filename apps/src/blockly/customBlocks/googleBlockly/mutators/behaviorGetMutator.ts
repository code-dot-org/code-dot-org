import GoogleBlockly from 'blockly/core';

import {ProcedureBlock} from '@cdo/apps/blockly/types';

import {commonFunctions} from './commonProcedureCallerMutator';

export const behaviorGetMutator = {
  previousEnabledState_: true,

  paramsFromSerializedState_: [],

  domToMutation: function (this: ProcedureBlock, element: Element) {
    const name =
      element.getAttribute('name') ||
      element.nextElementSibling?.textContent ||
      '';
    this.behaviorId = element.nextElementSibling?.getAttribute('id');
    this.deserialize_(name, []);
  },

  // We shouldn't ever need to save behaviors as XML because Sprite Lab also saves to JSON.
  // However, this function would create the appropriate mutation if did.
  mutationToDom: function (this: ProcedureBlock) {
    const container = GoogleBlockly.utils.xml.createElement('mutation');
    if (this.behaviorId !== undefined && this.behaviorId !== null) {
      container.setAttribute('behaviorId', this.behaviorId);
    }
    container.setAttribute('name', this.getFieldValue('NAME'));
    return container;
  },

  ...commonFunctions,
};
