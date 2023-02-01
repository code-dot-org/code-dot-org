/** @file Redux actions and reducer for the AnimationTab */

const SELECT_ANIMATION = 'AnimationTab/SELECT_ANIMATION';
const SET_COLUMN_SIZES = 'AnimationTab/SET_COLUMN_SIZES';

const initialState = {
  currentAnimations: {default: '', background: ''},
  columnSizes: [150, undefined]
};

export default (state = initialState, action) => {
  if (action.type === SELECT_ANIMATION) {
    return {
      ...state,
      currentAnimations: {
        ...state.currentAnimations,
        default: action.animationKey
      }
    };
  }
  if (action.type === SET_COLUMN_SIZES) {
    return {...state, columnSizes: action.sizes};
  }
  return state;
};

/**
 * Select an animation in the animation list.
 * @param {AnimationKey} animationKey
 * @returns {{type: string, animationKey: AnimationKey}}
 */
export function selectAnimation(animationKey, isBackground) {
  return {type: SELECT_ANIMATION, animationKey};
}

/**
 * Set sizes of the columns on the animation tab.
 * @param {number[]} sizes
 * @returns {{type: string, sizes: number[]}}
 */
export function setColumnSizes(sizes) {
  return {type: SET_COLUMN_SIZES, sizes};
}
