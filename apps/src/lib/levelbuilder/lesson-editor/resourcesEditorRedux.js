import _ from 'lodash';

const INIT = 'resourcesEditor/INIT';
const ADD_RESOURCE = 'resourcesEditor/ADD_RESOURCE';
const REMOVE_RESOURCE = 'resourcesEditor/REMOVE_RESOURCE';

export const initResources = resources => ({
  type: INIT,
  resources
});

export const addResource = newResource => ({
  type: ADD_RESOURCE,
  newResource
});

export const removeResource = key => ({
  type: REMOVE_RESOURCE,
  key
});

export default function resources(state = [], action) {
  let newState = _.cloneDeep(state);

  switch (action.type) {
    case INIT:
      return action.resources;
    case ADD_RESOURCE: {
      newState = newState.concat([action.newResource]);
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
