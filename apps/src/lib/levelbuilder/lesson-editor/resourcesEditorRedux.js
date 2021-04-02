import _ from 'lodash';
import PropTypes from 'prop-types';
import {resourceShape} from '@cdo/apps/lib/levelbuilder/shapes';

const INIT = 'resourcesEditor/INIT';
const ADD_RESOURCE = 'resourcesEditor/ADD_RESOURCE';
const EDIT_RESOURCE = 'resourcesEditor/EDIT_RESOURCE';
const REMOVE_RESOURCE = 'resourcesEditor/REMOVE_RESOURCE';

// Contains operations that can be done for migrated resources,
// i.e. ones backed by the Resource model on Rails

export const initResources = resources => ({
  type: INIT,
  resources
});

export const addResource = newResource => ({
  type: ADD_RESOURCE,
  newResource
});

export const editResource = updatedResource => ({
  type: EDIT_RESOURCE,
  updatedResource
});

export const removeResource = key => ({
  type: REMOVE_RESOURCE,
  key
});

// Verify that an array of resources all match resourceShape
function validateResourceList(resources, location) {
  const propTypes = {resource: PropTypes.arrayOf(resourceShape)};
  PropTypes.checkPropTypes(propTypes, {resources}, 'property', location);
}

// Verify that a given resource matches resourceShape
function validateResource(resource, location) {
  const propTypes = {resource: resourceShape};
  PropTypes.checkPropTypes(propTypes, {resource}, 'property', location);
}

export default function resources(state = [], action) {
  let newState = _.cloneDeep(state);

  switch (action.type) {
    case INIT:
      validateResourceList(action.resources, action.type);
      return action.resources;
    case ADD_RESOURCE: {
      validateResource(action.newResource, action.type);
      newState = newState.concat([action.newResource]);
      break;
    }
    case EDIT_RESOURCE: {
      validateResource(action.updatedResource, action.type);
      const resourceToEdit = newState.find(
        resource => resource.key === action.updatedResource.key
      );
      Object.assign(resourceToEdit, action.updatedResource);
      break;
    }
    case REMOVE_RESOURCE: {
      const resourceToRemove = newState.find(
        resource => resource.key === action.key
      );
      newState.splice(newState.indexOf(resourceToRemove), 1);
      break;
    }
  }

  return newState;
}
