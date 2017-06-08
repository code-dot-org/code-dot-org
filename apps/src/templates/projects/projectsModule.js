/** @file Redux actions and reducer for the Projects Gallery */
import {registerReducers} from '@cdo/apps/redux';
import _ from 'lodash';

// Action types

const TOGGLE_GALLERY = 'projectsModule/TOGGLE_GALLERY';
const ADD_OLDER_PROJECTS = 'projectsModule/ADD_OLDER_PROJECTS';
const SET_PROJECT_LISTS = 'projectsModule/SET_PROJECT_LISTS';
const SET_HAS_OLDER_PROJECTS = 'projectsModule/SET_HAS_OLDER_PROJECTS';

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

function projectLists(state, action) {
  // A map from project type to array of projects, e.g.:
  //   {
  //     applab: [{...}, {...}, {...}]
  //     gamelab: [{...}, {...}, {...}]
  //     playlab: [{...}, {...}, {...}]
  //     artist: [{...}, {...}, {...}]
  //   }
  state = state || {};
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
    default:
      return state;
  }
}

function hasOlderProjects(state, action) {
  // Whether there are more projects of each type on the server which are
  // older than the ones we have on the client.
  state = state || {
    applab: true,
    gamelab: true,
    playlab: true,
    artist: true,
  };
  switch (action.type) {
    case SET_HAS_OLDER_PROJECTS:
      state = {...state};
      state[action.projectType] = action.hasOlderProjects;
      return state;
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
  return {projects, projectType, type: ADD_OLDER_PROJECTS};
}

export function setProjectLists(projectLists) {
  return {projectLists, type: SET_PROJECT_LISTS};
}

export function setHasOlderProjects(hasOlderProjects, projectType) {
  return {hasOlderProjects, projectType, type: SET_HAS_OLDER_PROJECTS};
}

registerReducers({selectedGallery, projectLists, hasOlderProjects});
