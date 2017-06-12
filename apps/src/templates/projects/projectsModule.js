/** @file Redux actions and reducer for the Projects Gallery */
import {registerReducers} from '@cdo/apps/redux';
import _ from 'lodash';

// Action types

const TOGGLE_GALLERY = 'selectedGallery/TOGGLE_GALLERY';
const ADD_OLDER_PROJECTS = 'projectLists/ADD_OLDER_PROJECTS';
const SET_PROJECT_LISTS = 'projectLists/SET_PROJECT_LISTS';
const SET_HAS_OLDER_PROJECTS = 'hasOlderProjects/SET_HAS_OLDER_PROJECTS';
const ADD_NEWER_PROJECTS = 'projectLists/ADD_NEWER_PROJECTS';

// Reducers

export function selectedGallery(state, action) {
  state = state || 'PUBLIC';
  switch (action.type) {
    case TOGGLE_GALLERY:
      return action.projectType;
    default:
      return state;
  }
}

// A map from project type to array of projects
const initialProjectListState = {
  applab: [],
  gamelab: [],
  playlab: [],
  artist: [],
};

export function projectLists(state = initialProjectListState, action) {
  switch (action.type) {
    case SET_PROJECT_LISTS:
      return action.projectLists;
    case ADD_OLDER_PROJECTS: {
      // Append the incoming list of older projects to the existing list,
      // removing duplicates.
      const {projects, projectType} = action;
      state = {...state};
      state[projectType] = _.unionBy(state[projectType], projects, 'channel');
      return state;
    }
    case ADD_NEWER_PROJECTS: {
      // Prepend newer projects to the existing list, removing duplicates.
      const {projects, projectType} = action;
      return {
        ...state,
        [projectType]: _.unionBy(projects, state[projectType], 'channel'),
      };
    }
    default:
      return state;
  }
}

// Whether there are more projects of each type on the server which are
// older than the ones we have on the client.
const initialHasOlderProjects = {
  applab: true,
  gamelab: true,
  playlab: true,
  artist: true,
};

export function hasOlderProjects(state = initialHasOlderProjects, action) {
  switch (action.type) {
    case SET_HAS_OLDER_PROJECTS:
      return {
        ...state,
        [action.projectType]: action.hasOlderProjects,
      };
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

/**
 * Takes a list of older projects and appends it to the existing list of
 * projects of the specified type.
 * @param {Array} projects A list of projects which are all older than the
 * the current oldest project, newest first.
 * @param {string} projectType The type of the projects being added.
 * @returns {{projects: Array, projectType: string, type: string}}
 */
export function addOlderProjects(projects, projectType) {
  return {type: ADD_OLDER_PROJECTS, projects, projectType};
}

export function addNewerProjects(projects, projectType) {
  return {type: ADD_NEWER_PROJECTS, projects, projectType};
}

export function setProjectLists(projectLists) {
  return {type: SET_PROJECT_LISTS, projectLists};
}

export function setHasOlderProjects(hasOlderProjects, projectType) {
  return {type: SET_HAS_OLDER_PROJECTS, hasOlderProjects, projectType};
}

registerReducers({selectedGallery, projectLists, hasOlderProjects});
