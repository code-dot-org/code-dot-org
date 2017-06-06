/** @file Redux actions and reducer for the Projects Gallery */
import {registerReducers} from '@cdo/apps/redux';

// Actions
const TOGGLE_GALLERY = 'Projects/TOGGLE_GALLERY';

const isPublic = window.location.pathname.startsWith('/projects/public');

// Reducer
function pageLocation(state, action) {
  const defaultState = isPublic ? 'PUBLIC' : 'PRIVATE';
  state = state || defaultState;
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
