/**
 * @file Redux module for tracking when project reaches limit for sprites and texts
 */

const SET_SPRITES_REACH_LIMIT = 'limits/SET_SPRITES_REACH_LIMIT';
const RESET_SPRITES_REACH_LIMIT = 'limits/RESET_SPRITES_REACH_LIMIT';
const SET_TEXTS_REACH_LIMIT = 'limits/SET_TEXTS_REACH_LIMIT';
const RESET_TEXTS_REACH_LIMIT = 'limits/RESET_TEXTS_REACH_LIMIT';

const initialState = {
  spritesReachLimit: false,
  textsReachLimit: false
};

export default (state = initialState, action) => {
  if (action.type === SET_SPRITES_REACH_LIMIT) {
    return {
      ...state,
      spritesReachLimit: true
    };
  }
  if (action.type === RESET_SPRITES_REACH_LIMIT) {
    return {
      ...state,
      spritesReachLimit: false
    };
  }
  if (action.type === SET_TEXTS_REACH_LIMIT) {
    return {
      ...state,
      textsReachLimit: true
    };
  }
  if (action.type === RESET_TEXTS_REACH_LIMIT) {
    return {
      ...state,
      textsReachLimit: false
    };
  }
  return state;
};

export const setSpritesReachLimit = () => ({
  type: SET_SPRITES_REACH_LIMIT
});

export const resetSpritesReachLimit = () => ({
  type: RESET_SPRITES_REACH_LIMIT
});

export const setTextsReachLimit = () => ({
  type: SET_TEXTS_REACH_LIMIT
});

export const resetTextsReachLimit = () => ({
  type: RESET_TEXTS_REACH_LIMIT
});
