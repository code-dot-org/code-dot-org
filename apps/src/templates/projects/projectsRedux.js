/** @file Redux actions and reducer for the Projects Gallery */
import {combineReducers} from 'redux';
import $ from 'jquery';
import _ from 'lodash';
import {Galleries, MAX_PROJECTS_PER_CATEGORY} from './projectConstants';
import {PUBLISH_SUCCESS} from './publishDialog/publishDialogRedux';
import {DELETE_SUCCESS} from './deleteDialog/deleteProjectDialogRedux';
import {channels as channelsApi} from '../../clientApi';
import LibraryClientApi from '@cdo/apps/code-studio/components/libraries/LibraryClientApi';

// Action types

const TOGGLE_GALLERY = 'projects/TOGGLE_GALLERY';
const APPEND_PROJECTS = 'projects/APPEND_PROJECTS';
const SET_PROJECT_LISTS = 'projects/SET_PROJECT_LISTS';
const SET_HAS_OLDER_PROJECTS = 'projects/SET_HAS_OLDER_PROJECTS';
const PREPEND_PROJECTS = 'projects/PREPEND_PROJECTS';
const SET_PERSONAL_PROJECTS_LIST = 'projects/SET_PERSONAL_PROJECTS_LIST';
const UPDATE_PERSONAL_PROJECT_DATA = 'projects/UPDATE_PERSONAL_PROJECT_DATA';

const UNPUBLISH_REQUEST = 'projects/UNPUBLISH_REQUEST';
const UNPUBLISH_SUCCESS = 'projects/UNPUBLISH_SUCCESS';
const UNPUBLISH_FAILURE = 'projects/UNPUBLISH_FAILURE';

const START_RENAMING_PROJECT = 'projects/START_RENAMING_PROJECT';
const UPDATE_PROJECT_NAME = 'projects/UPDATE_PROJECT_NAME';
const CANCEL_RENAMING_PROJECT = 'projects/CANCEL_RENAMING_PROJECT';
const SAVE_SUCCESS = 'projects/SAVE_SUCCESS';
const SAVE_FAILURE = 'project/SAVE_FAILURE';
const UNSET_NAME_FAILURE = 'project/UNSET_NAME_FAILURE';

// Action creators

/**
 * Select a gallery to display on the projects page.
 * @param {string} projectType Default: 'PUBLIC'
 * @returns {{type: string, projectType: string}}
 */
export function selectGallery(projectType = Galleries.PUBLIC) {
  return {type: TOGGLE_GALLERY, projectType};
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

export function updatePersonalProjectData(projectId, data) {
  return {type: UPDATE_PERSONAL_PROJECT_DATA, projectId, data};
}

export function publishSuccess(lastPublishedAt, lastPublishedProjectData) {
  return {type: PUBLISH_SUCCESS, lastPublishedAt, lastPublishedProjectData};
}

export function unpublishSuccess(projectId) {
  return {type: UNPUBLISH_SUCCESS, projectId};
}

export function deleteSuccess(projectId) {
  return {type: DELETE_SUCCESS, projectId};
}

export function startRenamingProject(projectId) {
  return {type: START_RENAMING_PROJECT, projectId};
}

export function updateProjectName(projectId, updatedName) {
  return {type: UPDATE_PROJECT_NAME, projectId, updatedName};
}

export function cancelRenamingProject(projectId) {
  return {type: CANCEL_RENAMING_PROJECT, projectId};
}

export function saveSuccess(projectId, lastUpdatedAt) {
  return {type: SAVE_SUCCESS, projectId, lastUpdatedAt};
}

export function saveFailure(projectId, projectNameFailure) {
  return {type: SAVE_FAILURE, projectId, projectNameFailure};
}

export function unsetNameFailure(projectId) {
  return {type: UNSET_NAME_FAILURE, projectId};
}

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
  spritelab: [],
  gamelab: [],
  playlab: [],
  artist: [],
  dance: []
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
        [projectType]: _.unionBy(state[projectType], projects, 'channel')
      };
    }
    case PREPEND_PROJECTS: {
      // Prepend newer projects to the existing list, removing duplicates.
      const {projects, projectType} = action;
      return {
        ...state,
        [projectType]: _.unionBy(projects, state[projectType], 'channel')
      };
    }
    default:
      return state;
  }
}

// Whether there are more projects of each type on the server which are
// older than the ones we have on the client.
const initialHasOlderProjects = {
  special_topic: false,
  dance: true,
  applab: true,
  spritelab: true,
  gamelab: true,
  playlab: true,
  artist: true,
  minecraft: true,
  events: true,
  k1: true
};

function hasOlderProjects(state = initialHasOlderProjects, action) {
  switch (action.type) {
    case SET_HAS_OLDER_PROJECTS:
      return {
        ...state,
        [action.projectType]: action.hasOlderProjects
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
        projects: action.personalProjectsList
      };
    case UPDATE_PERSONAL_PROJECT_DATA:
      var projectsList = [...state.projects];
      var updatedProjectIndex = projectsList.findIndex(
        project => project.channel === action.projectId
      );
      projectsList[updatedProjectIndex] = action.data;

      return {
        ...state,
        projects: projectsList
      };
    case PUBLISH_SUCCESS:
      if (!state.projects) {
        // We haven't loaded the projects and therefore have nothing to update.
        return state;
      }
      var publishedChannel = action.lastPublishedProjectData.channel;

      var publishedProjectIndex = state.projects.findIndex(
        project => project.channel === publishedChannel
      );

      var updatedProjects = [...state.projects];
      updatedProjects[publishedProjectIndex] = {
        ...updatedProjects[publishedProjectIndex],
        publishedAt: action.lastPublishedAt
      };

      return {
        ...state,
        projects: updatedProjects
      };
    case UNPUBLISH_REQUEST:
      return {
        ...state,
        isUnpublishPending: true
      };
    case UNPUBLISH_SUCCESS:
      var unpublishedChannel = action.projectId;

      var unpublishedProjectIndex = state.projects.findIndex(
        project => project.channel === unpublishedChannel
      );

      var newProjects = [...state.projects];
      newProjects[unpublishedProjectIndex] = {
        ...newProjects[unpublishedProjectIndex],
        publishedAt: null
      };

      return {
        ...state,
        projects: newProjects
      };
    case UNPUBLISH_FAILURE:
      return {
        ...state,
        isUnpublishPending: false
      };
    case DELETE_SUCCESS:
      var deletedChannel = action.projectId;

      var deletedProjectIndex = state.projects.findIndex(
        project => project.channel === deletedChannel
      );

      var projects = [...state.projects];
      projects.splice(deletedProjectIndex, 1);

      return {
        ...state,
        projects: projects
      };
    case START_RENAMING_PROJECT:
      var projectToRename = action.projectId;

      var projectToRenameIndex = state.projects.findIndex(
        project => project.channel === projectToRename
      );

      var updatedEditing = [...state.projects];

      updatedEditing[projectToRenameIndex] = {
        ...updatedEditing[projectToRenameIndex],
        isEditing: true,
        updatedName: updatedEditing[projectToRenameIndex].name
      };

      return {
        ...state,
        projects: updatedEditing
      };
    case UPDATE_PROJECT_NAME:
      var projectBeingRenamed = action.projectId;

      var projectBeingRenamedIndex = state.projects.findIndex(
        project => project.channel === projectBeingRenamed
      );

      var projectsWithRename = [...state.projects];

      projectsWithRename[projectBeingRenamedIndex] = {
        ...projectsWithRename[projectBeingRenamedIndex],
        updatedName: action.updatedName
      };

      return {
        ...state,
        projects: projectsWithRename
      };
    case CANCEL_RENAMING_PROJECT:
      var projectNoLongerBeingRenamed = action.projectId;

      var projectNoLongerBeingRenamedIndex = state.projects.findIndex(
        project => project.channel === projectNoLongerBeingRenamed
      );

      var updatedNotEditing = [...state.projects];

      updatedNotEditing[projectNoLongerBeingRenamedIndex] = {
        ...updatedNotEditing[projectNoLongerBeingRenamedIndex],
        isEditing: false
      };
      return {
        ...state,
        projects: updatedNotEditing
      };
    case SAVE_SUCCESS:
      var recentlySavedProjectId = action.projectId;

      var recentlySavedProjectIndex = state.projects.findIndex(
        project => project.channel === recentlySavedProjectId
      );

      var savedProjects = [...state.projects];

      var recentlySavedProject = savedProjects[recentlySavedProjectIndex];

      savedProjects[recentlySavedProjectIndex] = {
        ...recentlySavedProject,
        name: recentlySavedProject.updatedName,
        isSaving: false,
        isEditing: false,
        updatedAt: action.lastUpdatedAt
      };

      return {
        ...state,
        projects: savedProjects
      };
    case SAVE_FAILURE:
      var saveAttemptProjectId = action.projectId;

      var saveAttemptProjectIndex = state.projects.findIndex(
        project => project.channel === saveAttemptProjectId
      );

      var unsavedProjects = [...state.projects];

      var saveAttemptProject = unsavedProjects[saveAttemptProjectIndex];

      unsavedProjects[saveAttemptProjectIndex] = {
        ...saveAttemptProject,
        isSaving: false,
        isEditing: false
      };

      if (action.projectNameFailure) {
        unsavedProjects[saveAttemptProjectIndex].projectNameFailure =
          action.projectNameFailure;
        unsavedProjects[saveAttemptProjectIndex].isEditing = true;
      }

      return {
        ...state,
        projects: unsavedProjects
      };
    case UNSET_NAME_FAILURE:
      var nameFailureProjectId = action.projectId;

      var nameFailureProjectIndex = state.projects.findIndex(
        project => project.channel === nameFailureProjectId
      );

      var nameFailureProjects = [...state.projects];

      var nameFailureProject = nameFailureProjects[nameFailureProjectIndex];

      nameFailureProjects[nameFailureProjectIndex] = {
        ...nameFailureProject,
        projectNameFailure: undefined
      };

      return {
        ...state,
        projects: nameFailureProjects
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

export const setPublicProjects = () => {
  return dispatch => {
    $.ajax({
      method: 'GET',
      url: `/api/v1/projects/gallery/public/all/${MAX_PROJECTS_PER_CATEGORY}`,
      dataType: 'json'
    }).done(projectLists => {
      dispatch(setProjectLists(projectLists));
    });
  };
};

export const setPersonalProjects = () => {
  return dispatch => {
    $.ajax({
      method: 'GET',
      url: '/api/v1/projects/personal',
      dataType: 'json'
    }).done(personalProjectsList => {
      dispatch(setPersonalProjectsList(personalProjectsList));
    });
  };
};

const fetchProjectToUpdate = (projectId, onComplete) => {
  $.ajax({
    url: `/v3/channels/${projectId}`,
    method: 'GET',
    type: 'json',
    contentType: 'application/json;charset=UTF-8'
  })
    .done(data => {
      onComplete(null, data);
    })
    .fail((jqXhr, status) => {
      onComplete(status, jqXhr.responseJSON);
    });
};

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
            projectId: projectId
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

export const updateProjectLibrary = (projectId, newData) => {
  return dispatch => {
    fetchProjectToUpdate(projectId, (error, project) => {
      if (error) {
        console.error(error);
      } else {
        let updatedData = {...project, ...newData};
        $.ajax({
          url: `/v3/channels/${project.id}`,
          method: 'POST',
          type: 'json',
          contentType: 'application/json;charset=UTF-8',
          data: JSON.stringify(updatedData)
        });
        // the channels api returns `channel` as `id` but our redux object
        // expects `channel`. Adding that here.
        updatedData.channel = project.id;
        dispatch(updatePersonalProjectData(project.id, updatedData));
      }
    });
  };
};

export const unpublishProjectLibrary = (
  projectId,
  onComplete,
  libraryApi = new LibraryClientApi(projectId)
) => {
  return dispatch => {
    fetchProjectToUpdate(projectId, (error, data) => {
      if (error) {
        onComplete(error);
        return;
      }

      libraryApi.unpublish(data, (error, _) => onComplete(error));
    });
  };
};

const updateProjectNameOnServer = project => {
  return dispatch => {
    $.ajax({
      url: `/v3/channels/${project.id}`,
      method: 'POST',
      type: 'json',
      contentType: 'application/json;charset=UTF-8',
      data: JSON.stringify(project)
    })
      .done(data => {
        dispatch(saveSuccess(project.id, data.updatedAt));
      })
      .fail((jqXhr, status) => {
        dispatch(saveFailure(project.id, jqXhr.responseJSON.nameFailure));
      });
  };
};

export const saveProjectName = (projectId, updatedName) => {
  return dispatch => {
    fetchProjectToUpdate(projectId, (error, data) => {
      if (error) {
        console.error(error);
      } else {
        data.name = updatedName;
        dispatch(updateProjectNameOnServer(data));
      }
    });
  };
};

export const remix = (projectId, projectType) => {
  window.location = `/projects/${projectType}/${projectId}/remix`;
};
