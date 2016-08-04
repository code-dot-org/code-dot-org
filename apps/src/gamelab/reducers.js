/** @file Redux reducer functions for Game Lab.
 *  @see http://redux.js.org/docs/basics/Reducers.html */
'use strict';

import {CHANGE_INTERFACE_MODE} from './actions';
import animationList from './animationListModule';
import animationPicker from './AnimationPicker/animationPickerModule';
import animationTab from './AnimationTab/animationTabModule';
var errorDialogStack = require('./errorDialogStackModule').default;
var GameLabInterfaceMode = require('./constants').GameLabInterfaceMode;


function interfaceMode(state, action) {
  state = state || GameLabInterfaceMode.CODE;

  switch (action.type) {
    case CHANGE_INTERFACE_MODE:
      return action.interfaceMode;
    default:
      return state;
  }
}

module.exports = {
  animationPicker,
  animationTab,
  animationList,
  errorDialogStack,
  interfaceMode
};
