/** @file Redux actions and reducer for the AnimationTab */
import {combineReducers} from 'redux';

const SELECT_ANIMATION = 'AnimationTab/SELECT_ANIMATION';
const SET_COLUMN_SIZES = 'AnimationTab/SET_COLUMN_SIZES';

export default combineReducers({
  columnSizes,
  selectedAnimation
});

function selectedAnimation(state, action) {
  state = state || '';
  switch (action.type) {
    case SELECT_ANIMATION:
      return action.animationKey;
    default:
      return state;
  }
}

/**
 * Select an animation in the animation list.
 * @param {AnimationKey} animationKey
 * @returns {{type: string, animationKey: AnimationKey}}
 */
export function selectAnimation(animationKey) {
  return {type: SELECT_ANIMATION, animationKey};
}

/**
 * Subreducer to set animation tab column widths.  Expected format for
 * widths is an array of numbers, with an 'undefined' entry for a column
 * that grows to fill available space.
 */
function columnSizes(state, action) {
  state = state || [150, undefined];
  switch (action.type) {
    case SET_COLUMN_SIZES:
      return action.sizes;
    default:
      return state;
  }
}

/**
 * Set sizes of the columns on the animation tab.
 * @param {number[]} sizes
 * @returns {{type: string, sizes: number[]}}
 */
export function setColumnSizes(sizes) {
  return {type: SET_COLUMN_SIZES, sizes};
}
