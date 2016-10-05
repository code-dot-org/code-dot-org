import Immutable from 'immutable';
import reducer, * as watchedExpressions from '@cdo/apps/redux/watchedExpressions';
import {expect} from '../../util/configuredChai';

describe('watchedExpressions', function () {
  describe('reducer', function () {
    var initialState = Immutable.List();

    it('has expected default state', function () {
      expect(reducer(undefined, [])).to.deep.equal(initialState);
    });

    it('returns original state on unhandled action', function () {
      const state = Immutable.List();
      expect(reducer(state, {})).to.equal(state);
    });

    describe('action: add', function () {
      const add = watchedExpressions.add;
      it('adds items to the state', function () {
        const state = Immutable.List();
        expect(state.size).to.equal(0);
        const testVarString = 'my cool variable';
        const newState = reducer(state, add(testVarString));
        expect(newState).not.to.equal(state);
        expect(newState.size).to.equal(1);
        expect(newState.get(0).get('expression')).to.equal(testVarString);
      });
    });

    const singleItemState = Immutable.List([
      Immutable.Map({
        expression: 'test',
        lastValue: 0
      })
    ]);

    const twoItemState = singleItemState.push(
      Immutable.Map({
        expression: 'test2',
        lastValue: 1
      })
    );

    describe('action: update', function () {
      const update = watchedExpressions.update;
      it('updates values of items in the state', function () {
        const newState = reducer(singleItemState, update('test', 2));
        expect(newState).not.to.equal(singleItemState);
        expect(newState.size).to.equal(1);
        expect(newState.get(0).get('expression')).to.equal('test');
        expect(newState.get(0).get('lastValue')).to.equal(2);
      });
    });

    describe('action: remove', function () {
      const remove = watchedExpressions.remove;
      it('removes items from the state', function () {
        expect(twoItemState.size).to.equal(2);
        const newState = reducer(twoItemState, remove('test2'));
        expect(newState).not.to.equal(twoItemState);
        expect(newState.size).to.equal(1);
        expect(newState.get(0).get('expression')).to.equal('test');
      });
    });
  });
});
