/** @file Redux actions and reducer for the Projects Gallery */
import {registerReducers} from '@cdo/apps/redux';

// Actions
const TOGGLE_GALLERY = 'Projects/TOGGLE_GALLERY';

// Reducer
function pageLocation(state, action) {
  state = state || 'PRIVATE';
  switch (action.type) {
    case TOGGLE_GALLERY:
      return action.projectType;
    default:
      return state;
  }
}

/**
 * Select a gallery to display on the projects page.
 * @param {string} projectType
 * @returns {{type: string, projectType: string}}
 */
export function selectGallery(projectType) {
  return { type: TOGGLE_GALLERY, projectType: projectType };
}

registerReducers({pageLocation});
