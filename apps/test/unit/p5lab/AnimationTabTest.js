var animationTab = require('@cdo/apps/p5lab/redux/animationTab');
import {expect} from '../../util/deprecatedChai';

describe('AnimationTab', function() {
  describe('reducer', function() {
    var reducer = animationTab.default;
    var initialState = {
      columnSizes: [150, undefined],
      selectedAnimation: ''
    };

    it('has expected initial state', function() {
      expect(reducer(undefined, {})).to.deep.equal(initialState);
    });

    it('returns original state on unhandled action', function() {
      var state = {columnSizes: [], selectedAnimation: 'whatever'};
      expect(reducer(state, {})).to.equal(state);
    });

    describe('action: selectAnimation', function() {
      var selectAnimation = animationTab.selectAnimation;

      it('changes selected animation in state', function() {
        var newState = reducer(initialState, selectAnimation('animationKey'));
        expect(newState).not.to.equal(initialState);
        expect(newState).to.have.deep.property(
          'selectedAnimation',
          'animationKey'
        );
      });

      it('does not change state if animation already selected', function() {
        var state = {columnSizes: [], selectedAnimation: 'anotherKey'};
        var newState = reducer(state, selectAnimation('anotherKey'));
        expect(newState).to.equal(state);
      });
    });
  });
});
