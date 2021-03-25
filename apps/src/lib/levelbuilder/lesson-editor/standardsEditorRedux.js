import _ from 'lodash';

const INIT = 'standardsEditor/INIT';
const REMOVE_STANDARD = 'standardsEditor/REMOVE_STANDARD';

export const initStandards = standards => ({
  type: INIT,
  standards
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
