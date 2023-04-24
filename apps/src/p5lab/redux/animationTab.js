/** @file Redux actions and reducer for the AnimationTab */

import {P5LabInterfaceMode} from '../constants';

const SELECT_ANIMATION = 'AnimationTab/SELECT_ANIMATION';
const SELECT_BACKGROUND = 'AnimationTab/SELECT_BACKGROUND';
const SET_COLUMN_SIZES = 'AnimationTab/SET_COLUMN_SIZES';

const initialState = {
  currentAnimations: {
    [P5LabInterfaceMode.ANIMATION]: '',
    [P5LabInterfaceMode.BACKGROUND]: '',
  },
  columnSizes: [150, undefined],
};

export default (state = initialState, action) => {
  if (action.type === SELECT_ANIMATION) {
    return {
      ...state,
      currentAnimations: {
        ...state.currentAnimations,
        [P5LabInterfaceMode.ANIMATION]: action.animationKey,
      },
    };
  }
  if (action.type === SELECT_BACKGROUND) {
    return {
      ...state,
      currentAnimations: {
        ...state.currentAnimations,
        [P5LabInterfaceMode.BACKGROUND]: action.animationKey,
      },
    };
  }
  if (action.type === SET_COLUMN_SIZES) {
    return {...state, columnSizes: action.sizes};
  }
  return state;
};

/**
 * Select an animation in the default animation list. (Game Lab animations or Sprite Lab Costumes)
 * @param {AnimationKey} animationKey
 * @returns {{type: string, animationKey: AnimationKey}}
 */
export function selectAnimation(animationKey) {
  return {type: SELECT_ANIMATION, animationKey};
}

/**
 * Select an animation in the background list. (Sprite Lab only)
 * @param {AnimationKey} animationKey
 * @returns {{type: string, animationKey: AnimationKey}}
 */
export function selectBackground(animationKey) {
  return {type: SELECT_BACKGROUND, animationKey};
}

/**
 * Set sizes of the columns on the animation tab.
 * @param {number[]} sizes
 * @returns {{type: string, sizes: number[]}}
 */
export function setColumnSizes(sizes) {
  return {type: SET_COLUMN_SIZES, sizes};
}
