import _ from 'lodash';

const INIT = 'standardsEditor/INIT';
const ADD_STANDARD = 'standardsEditor/ADD_STANDARD';
const REMOVE_STANDARD = 'standardsEditor/REMOVE_STANDARD';

export const initStandards = (standardType, standards) => ({
  type: INIT,
  standardType,
  standards
});

export const addStandard = (standardType, newStandard) => ({
  type: ADD_STANDARD,
  standardType,
  newStandard
});

export const removeStandard = (standardType, standard) => ({
  type: REMOVE_STANDARD,
  standardType,
  standard
});

export default function createStandardsReducer(standardType) {
  return function standards(state = [], action) {
    // Make it possible to create two instances of this reducer which do not
    // interfere with each other.
    if (standardType !== action.standardType) {
      return state;
    }

    let newState = _.cloneDeep(state);

    switch (action.type) {
      case INIT:
        return action.standards;
      case ADD_STANDARD: {
        newState = _.sortBy(
          newState.concat([action.newStandard]),
          'frameworkName',
          'shortcode'
        );
        break;
      }
      case REMOVE_STANDARD: {
        const standardToRemove = newState.find(
          standard =>
            standard.shortcode === action.standard.shortcode &&
            standard.frameworkShortcode === action.standard.frameworkShortcode
        );
        newState.splice(newState.indexOf(standardToRemove), 1);
        break;
      }
    }

    return newState;
  };
}
