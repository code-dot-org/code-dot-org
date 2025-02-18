import Immutable from 'immutable';

import reducer, * as watchedExpressions from '@cdo/apps/redux/watchedExpressions';
import {createUuid} from '@cdo/apps/utils';

describe('watchedExpressions', function () {
  describe('reducer', function () {
    var initialState = Immutable.List();

    it('has expected default state', function () {
      expect(reducer(undefined, [])).toEqual(initialState);
    });

    it('returns original state on unhandled action', function () {
      const state = Immutable.List();
      expect(reducer(state, {})).toBe(state);
    });

    describe('action: add', function () {
      const add = watchedExpressions.add;
      it('adds items to the state', function () {
        const state = Immutable.List();
        expect(state.size).toBe(0);
        const testVarString = 'my cool variable';
        const newState = reducer(state, add(testVarString));
        expect(newState).not.toBe(state);
        expect(newState.size).toBe(1);
        expect(newState.get(0).get('expression')).toBe(testVarString);
        expect(newState.get(0).get('uuid')).not.toBeNull();
      });
    });

    const singleItemState = Immutable.List([
      Immutable.Map({
        expression: 'test',
        lastValue: 0,
        uuid: createUuid(),
      }),
    ]);

    const twoItemState = singleItemState.push(
      Immutable.Map({
        expression: 'test2',
        lastValue: 1,
        uuid: createUuid(),
      })
    );

    describe('action: update', function () {
      const update = watchedExpressions.update;
      it('updates values of items in the state', function () {
        const newState = reducer(singleItemState, update('test', 2));
        expect(newState).not.toBe(singleItemState);
        expect(newState.size).toBe(1);
        expect(newState.get(0).get('expression')).toBe('test');
        expect(newState.get(0).get('lastValue')).toBe(2);
      });
    });

    describe('action: remove', function () {
      const remove = watchedExpressions.remove;
      it('removes items from the state', function () {
        expect(twoItemState.size).toBe(2);
        const newState = reducer(twoItemState, remove('test2'));
        expect(newState).not.toBe(twoItemState);
        expect(newState.size).toBe(1);
        expect(newState.get(0).get('expression')).toBe('test');
      });
    });
  });
});
