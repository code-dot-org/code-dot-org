/** @file Redux actions and reducer for the Projects Gallery */
import { combineReducers } from 'redux';
import _ from 'lodash';
import { Galleries } from './projectConstants';

// Action types

const TOGGLE_GALLERY = 'projects/TOGGLE_GALLERY';
const APPEND_PROJECTS = 'projects/APPEND_PROJECTS';
const SET_PROJECT_LISTS = 'projects/SET_PROJECT_LISTS';
const SET_HAS_OLDER_PROJECTS = 'projects/SET_HAS_OLDER_PROJECTS';
const PREPEND_PROJECTS = 'projects/PREPEND_PROJECTS';

// Reducers

const initialSelectedGalleryState = Galleries.PUBLIC;

function selectedGallery(state = initialSelectedGalleryState, action) {
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

function projectLists(state = initialProjectListState, action) {
  switch (action.type) {
    case SET_PROJECT_LISTS:
      return action.projectLists;
    case APPEND_PROJECTS: {
      // Append the incoming list of older projects to the existing list,
      // removing duplicates.
      const {projects, projectType} = action;
      return {
        ...state,
        [projectType]: _.unionBy(state[projectType], projects, 'channel'),
      };
    }
    case PREPEND_PROJECTS: {
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
  minecraft: true,
  events: true,
  k1: true,
};

function hasOlderProjects(state = initialHasOlderProjects, action) {
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

const reducer = combineReducers({
  selectedGallery,
  projectLists,
  hasOlderProjects,
});
export default reducer;

// Action creators

/**
 * Select a gallery to display on the projects page.
 * @param {string} projectType Default: 'PUBLIC'
 * @returns {{type: string, projectType: string}}
 */
export function selectGallery(projectType = Galleries.PUBLIC) {
  return { type: TOGGLE_GALLERY, projectType };
}

/**
 * Takes a list of projects and appends it to the existing list of
 * projects of the specified type.
 * @param {Array} projects A list of projects which are all older than the
 * the current oldest project, newest first.
 * @param {string} projectType The type of the projects being added.
 *   Valid values include applab, gamelab, playlab, or artist.
 */
export function appendProjects(projects, projectType) {
  return {type: APPEND_PROJECTS, projects, projectType};
}

/**
 * Takes a list of projects and adds it to the front of the list of projects of
 * the specified type.
 * @param {Array} projects A list of projects which are all newer than the
 * the current newest project, newest first.
 * @param {string} projectType The type of the projects being added.
 *   Valid values include applab, gamelab, playlab, or artist.
 */
export function prependProjects(projects, projectType) {
  return {type: PREPEND_PROJECTS, projects, projectType};
}

export function setProjectLists(projectLists) {
  return {type: SET_PROJECT_LISTS, projectLists};
}

export function setHasOlderProjects(hasOlderProjects, projectType) {
  return {type: SET_HAS_OLDER_PROJECTS, hasOlderProjects, projectType};
}
