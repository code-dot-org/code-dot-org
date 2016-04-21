/** @file Redux reducer functions for the AnimationPicker component.
 *  @see http://redux.js.org/docs/basics/Reducers.html */
'use strict';

var actions = require('./actions');
var ActionType = actions.ActionType;
var View = actions.View;

var initialAnimationPickerState = {
  currentView: View.PICKER
};

module.exports = {
  animationPicker: function (state, action) {
    state = state || initialAnimationPickerState;
    switch (action.type) {
      case ActionType.RESET_ANIMATION_PICKER:
        return initialAnimationPickerState;

      case ActionType.BEGIN_UPLOAD:
        return {
          currentView: View.UPLOAD_IN_PROGRESS,
          originalFileName: action.originalFileName
        };

      case ActionType.DISPLAY_ERROR:
        return {
          currentView: View.ERROR,
          status: action.status
        };

      default:
        return state;
    }
  }
};
