import _ from 'lodash';

const INIT = 'standardsEditor/INIT';

export const initStandards = standards => ({
  type: INIT,
  standards
});

export default function standards(state = [], action) {
  let newState = _.cloneDeep(state);

  switch (action.type) {
    case INIT:
      return action.standards;
  }

  return newState;
}
