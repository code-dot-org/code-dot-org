import _ from 'lodash';
import PropTypes from 'prop-types';
import {programmingExpressionShape} from '@cdo/apps/lib/levelbuilder/shapes';

const INIT = 'programmingExpressionsEditor/INIT';
const REMOVE_PROGRAMMING_EXPRESSION =
  'programmingExpressionsEditor/REMOVE_PROGRAMMING_EXPRESSION';

export const initProgrammingExpressions = programmingExpressions => ({
  type: INIT,
  programmingExpressions
});

export const removeProgrammingExpression = id => ({
  type: REMOVE_PROGRAMMING_EXPRESSION,
  id
});

// Verify that an array of programmingExpressions all match programmingExpressionShape
function validateProgrammingExpressionList(programmingExpressions, location) {
  const propTypes = {
    programmingExpression: PropTypes.arrayOf(programmingExpressionShape)
  };
  PropTypes.checkPropTypes(
    propTypes,
    {programmingExpressions},
    'property',
    location
  );
}

export default function programmingExpressions(state = [], action) {
  let newState = _.cloneDeep(state);

  switch (action.type) {
    case INIT:
      validateProgrammingExpressionList(
        action.programmingExpressions,
        action.type
      );
      return action.programmingExpressions;
    case REMOVE_PROGRAMMING_EXPRESSION: {
      const programmingExpressionToRemove = newState.find(
        programmingExpression => programmingExpression.id === action.id
      );
      newState.splice(newState.indexOf(programmingExpressionToRemove), 1);
      break;
    }
  }

  return newState;
}
