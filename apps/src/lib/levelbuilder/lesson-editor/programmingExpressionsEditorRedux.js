import _ from 'lodash';
import PropTypes from 'prop-types';
import {programmingExpressionShape} from '@cdo/apps/lib/levelbuilder/shapes';

const INIT = 'programmingExpressionsEditor/INIT';
const ADD_PROGRAMMING_EXPRESSION =
  'programmingExpressionsEditor/ADD_PROGRAMMING_EXPRESSION';
const REMOVE_PROGRAMMING_EXPRESSION =
  'programmingExpressionsEditor/REMOVE_PROGRAMMING_EXPRESSION';

export const initProgrammingExpressions = programmingExpressions => ({
  type: INIT,
  programmingExpressions
});

export const addProgrammingExpression = newProgrammingExpression => ({
  type: ADD_PROGRAMMING_EXPRESSION,
  newProgrammingExpression
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

// Verify that a given programmingExpression matches programmingExpressionShape
function validateProgrammingExpression(programmingExpression, location) {
  const propTypes = {programmingExpression: programmingExpressionShape};
  PropTypes.checkPropTypes(
    propTypes,
    {programmingExpression},
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
    case ADD_PROGRAMMING_EXPRESSION: {
      validateProgrammingExpression(
        action.newProgrammingExpression,
        action.type
      );
      newState.push(action.newProgrammingExpression);
      break;
    }
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
