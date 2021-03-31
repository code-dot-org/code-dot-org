import _ from 'lodash';

const INIT = 'standardsEditor/INIT';
const ADD_STANDARD = 'standardsEditor/ADD_STANDARD';
const REMOVE_STANDARD = 'standardsEditor/REMOVE_STANDARD';

export const initStandards = standards => ({
  type: INIT,
  standards
});

export const addStandard = newStandard => ({
  type: ADD_STANDARD,
  newStandard
});

export const removeStandard = (frameworkShortcode, shortcode) => ({
  type: REMOVE_STANDARD,
  frameworkShortcode,
  shortcode
});

export default function standards(state = [], action) {
  let newState = _.cloneDeep(state);

  switch (action.type) {
    case INIT:
      return action.standards;
    case ADD_STANDARD: {
      newState = newState.concat([action.newStandard]);
      break;
    }
    case REMOVE_STANDARD: {
      const standardToRemove = newState.find(
        standard =>
          standard.shortcode === action.shortcode &&
          standard.frameworkShortcode === action.frameworkShortcode
      );
      newState.splice(newState.indexOf(standardToRemove), 1);
      break;
    }
  }

  return newState;
}
