import Immutable from 'immutable';
import {createUuid} from '../utils';

/**
 * Duck module for Watchers expression updating/dispatching.
 */

/**
 * ACTION CONSTANTS
 */
const ADD_EXPRESSION = 'watchedExpressions/ADD_EXPRESSION';
const REMOVE_EXPRESSION = 'watchedExpressions/REMOVE_EXPRESSION';
const UPDATE_VALUE = 'watchedExpressions/UPDATE_VALUE';

/**
 * REDUCERS
 */

/**
 * @typedef {Object} WatchedExpression
 * @property {string} expression
 * @property {string} lastValue
 */

/**
 * @type {Array.<WatchedExpression>}
 */
const watchedExpressionsInitialState = Immutable.List();

export default function reducer(state = watchedExpressionsInitialState, action) {
  if (action.type === ADD_EXPRESSION) {
    const {expression} = action;
    const uuid = createUuid();
    return state.push(Immutable.Map({expression, uuid}));
  }

  if (action.type === UPDATE_VALUE) {
    const {value, expression} = action;
    return state.map(e => e.get('expression') === expression ? Immutable.Map({
      lastValue: value,
      expression,
      uuid: e.get('uuid')
    }) : e);
  }

  if (action.type === REMOVE_EXPRESSION) {
    return state.filter(e => e.get('expression') !== action.expression);
  }

  return state;
}

/**
 * ACTION CREATORS
 *  (e.g. function doAThing(n) { return {type: DO_A_THING, arg: n}; })
 */

export const add = (expression) => ({
  type: ADD_EXPRESSION,
  expression
});

export const remove = (expression) => ({
  type: REMOVE_EXPRESSION,
  expression
});

export const update = (expression, value) => ({
  type: UPDATE_VALUE,
  expression,
  value
});
