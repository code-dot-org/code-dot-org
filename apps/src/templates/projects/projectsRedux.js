/** @file Redux actions and reducer for the Projects Gallery */
import { combineReducers } from 'redux';
import _ from 'lodash';
import { Galleries } from './projectConstants';
import {PUBLISH_SUCCESS} from './publishDialog/publishDialogRedux';
import {channels as channelsApi} from '../../clientApi';

// Action types

const TOGGLE_GALLERY = 'projects/TOGGLE_GALLERY';
const APPEND_PROJECTS = 'projects/APPEND_PROJECTS';
const SET_PROJECT_LISTS = 'projects/SET_PROJECT_LISTS';
const SET_HAS_OLDER_PROJECTS = 'projects/SET_HAS_OLDER_PROJECTS';
const PREPEND_PROJECTS = 'projects/PREPEND_PROJECTS';
const SET_PERSONAL_PROJECTS_LIST = 'projects/SET_PERSONAL_PROJECTS_LIST';

const UNPUBLISH_REQUEST  = 'projects/UNPUBLISH_REQUEST';
const UNPUBLISH_SUCCESS  = 'projects/UNPUBLISH_SUCCESS';
const UNPUBLISH_FAILURE  = 'projects/UNPUBLISH_FAILURE';

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

const initialPersonalProjectsList = [];

function personalProjectsList(state = initialPersonalProjectsList, action) {
  switch (action.type) {
    case SET_PERSONAL_PROJECTS_LIST:
      return {
        ...state,
        projects: action.personalProjectsList,
      };
    case PUBLISH_SUCCESS:
      var publishedChannel = action.lastPublishedProjectData.channel;

      var publishedProjectIndex = state.projects.findIndex(project => project.channel === publishedChannel);

      var updatedProjects = [...state.projects];
      updatedProjects[publishedProjectIndex].publishedAt = action.lastPublishedAt;

      return {
        ...state,
        projects: updatedProjects
      };
    case UNPUBLISH_REQUEST:
      return {
        ...state,
        isUnpublishPending: true,
      };
    case UNPUBLISH_SUCCESS:
      var unpublishedChannel = action.projectId;

      var unpublishedProjectIndex = state.projects.findIndex(project => project.channel === unpublishedChannel);

      var newProjects = [...state.projects];
      newProjects[unpublishedProjectIndex].publishedAt = null;

      return {
        ...state,
        projects: newProjects
      };
    case UNPUBLISH_FAILURE:
      return {
        ...state,
        isUnpublishPending: false,
      };
    default:
      return state;
  }
}

const reducer = combineReducers({
  selectedGallery,
  projectLists,
  hasOlderProjects,
  personalProjectsList
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

export function setPersonalProjectsList(personalProjectsList) {
  return {type: SET_PERSONAL_PROJECTS_LIST, personalProjectsList};
}

export function unpublishProject(projectId) {
  return dispatch => {
    dispatch({type: UNPUBLISH_REQUEST});
    return new Promise((resolve, reject) => {
      channelsApi.withProjectId(projectId).ajax(
        'POST',
        'unpublish',
        () => {
          dispatch({
            type: UNPUBLISH_SUCCESS,
            projectId: projectId,
          });
          resolve();
        },
        err => {
          dispatch({type: UNPUBLISH_FAILURE});
          reject(err);
        },
        null
      );
    });
  };
}

export function publishSuccess(lastPublishedAt, lastPublishedProjectData) {
  return {type: PUBLISH_SUCCESS, lastPublishedAt,
  lastPublishedProjectData};
}

export function unpublishSuccess(projectId) {
  return {type: UNPUBLISH_SUCCESS, projectId};
}
