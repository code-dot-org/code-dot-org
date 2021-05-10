import _ from 'lodash';
import PropTypes from 'prop-types';
import {resourceShape} from '@cdo/apps/lib/levelbuilder/shapes';

const INIT = 'resourcesEditor/INIT';
const ADD_RESOURCE = 'resourcesEditor/ADD_RESOURCE';
const EDIT_RESOURCE = 'resourcesEditor/EDIT_RESOURCE';
const REMOVE_RESOURCE = 'resourcesEditor/REMOVE_RESOURCE';

// Contains operations that can be done for migrated resources,
// i.e. ones backed by the Resource model on Rails

export const initResources = (resourceContext, resources) => ({
  type: INIT,
  resourceContext,
  resources
});

export const addResource = (resourceContext, newResource) => ({
  type: ADD_RESOURCE,
  resourceContext,
  newResource
});

export const editResource = (resourceContext, updatedResource) => ({
  type: EDIT_RESOURCE,
  resourceContext,
  updatedResource
});

export const removeResource = (resourceContext, key) => ({
  type: REMOVE_RESOURCE,
  resourceContext,
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

export default function createResourcesReducer(resourceContext) {
  return function resources(state = [], action) {
    if (resourceContext !== action.resourceContext) {
      return state;
    }

    let newState = _.cloneDeep(state);

    switch (action.type) {
      case INIT:
        validateResourceList(action.resources, action.type);
        return action.resources;
      case ADD_RESOURCE: {
        validateResource(action.newResource, action.type);
        newState = newState.concat([action.newResource]);
        newState.sort((r1, r2) => r1.isRollup - r2.isRollup);
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
  };
}
