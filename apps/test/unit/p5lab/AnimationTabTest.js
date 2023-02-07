var animationTab = require('@cdo/apps/p5lab/redux/animationTab');
import {expect} from '../../util/reconfiguredChai';

describe('AnimationTab', function() {
  describe('reducer', function() {
    var reducer = animationTab.default;
    var initialState = {
      columnSizes: [150, undefined],
      currentAnimations: {default: '', background: ''},
      currentAnimationType: 'default'
    };

    it('has expected initial state', function() {
      expect(reducer(undefined, {})).to.deep.equal(initialState);
    });

    it('returns original state on unhandled action', function() {
      var state = {
        columnSizes: [150, undefined],
        currentAnimations: {default: 'whatever', background: ''}
      };
      expect(reducer(state, {})).to.equal(state);
    });

    describe('action: selectAnimation', function() {
      var selectAnimation = animationTab.selectAnimation;

      it('changes selected animation in state', function() {
        var newState = reducer(initialState, selectAnimation('animationKey'));
        expect(newState).not.to.equal(initialState);
        expect(newState).to.have.deep.property(
          'currentAnimations.default',
          'animationKey'
        );
      });

      it('does not change state if animation already selected', function() {
        var state = {
          columnSizes: [150, undefined],
          currentAnimations: {default: 'anotherKey', background: ''}
        };
        var newState = reducer(state, selectAnimation('anotherKey'));
        expect(newState).to.deep.equal(state);
      });
    });

    describe('action: selectBackground', function() {
      var selectBackground = animationTab.selectBackground;

      it('changes selected background in state', function() {
        var newState = reducer(initialState, selectBackground('backgroundKey'));
        expect(newState).not.to.equal(initialState);
        expect(newState).to.have.deep.property(
          'currentAnimations.background',
          'backgroundKey'
        );
      });

      it('does not change state if background already selected', function() {
        var state = {
          columnSizes: [150, undefined],
          currentAnimations: {default: '', background: 'anotherKey'}
        };
        var newState = reducer(state, selectBackground('anotherKey'));
        expect(newState).to.deep.equal(state);
      });
    });
  });
});
