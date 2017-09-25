/** @file Track the app's layout */
const SET_VISUALIZATION_SCALE = 'layout/SET_VISUALIZATION_SCALE';

const initialState = {
  visualizationScale: null
};

/**
 * Reducer for layout.
 */
export default function reducer(state = initialState, action) {
  if (action.type === SET_VISUALIZATION_SCALE) {
    return {...state, visualizationScale: action.scale};
  }
  return state;
}

/**
 * @param {number} scale the new visualization scale.
 * @returns {{type: string, scale: number}}
 */

export function setVisualizationScale(scale) {
  return {type: SET_VISUALIZATION_SCALE, scale};
}

function getRoot(state) {
  // Should be the only global knowledge here
  return state.layout;
}

export function getVisualizationScale(state) {
  return getRoot(state).visualizationScale;
}
