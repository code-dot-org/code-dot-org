/** @file Redux actions and reducer for the Projects Gallery */
import {registerReducers} from '@cdo/apps/redux';

// Action types
const TOGGLE_GALLERY = 'projectsModule/TOGGLE_GALLERY';

// Reducer
export function selectedGallery(state, action) {
  state = state || 'PUBLIC';
  switch (action.type) {
    case TOGGLE_GALLERY:
      return action.projectType;
    default:
      return state;
  }
}

// Action creators
/**
 * Select a gallery to display on the projects page.
 * @param {string} projectType
 * @returns {{type: string, projectType: string}}
 */
export function selectGallery(projectType) {
  projectType = projectType || 'PUBLIC';
  return { type: TOGGLE_GALLERY, projectType: projectType };
}

registerReducers({selectedGallery});
