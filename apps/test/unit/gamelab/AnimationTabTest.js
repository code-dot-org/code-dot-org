var animationTabModule = require('@cdo/apps/gamelab/AnimationTab/animationTabModule');
import {expect} from '../../util/configuredChai';
import {ADD_ANIMATION_AT} from '@cdo/apps/gamelab/animationModule';

describe('AnimationTab', function () {
  describe('reducer', function () {
    var reducer = animationTabModule.default;
    var initialState = {
      columnSizes: [150, 250, undefined],
      selectedAnimation: ''
    };

    it('has expected initial state', function () {
      expect(reducer(undefined, {})).to.deep.equal(initialState);
    });

    it('returns original state on unhandled action', function () {
      var state = { columnSizes: [], selectedAnimation: 'whatever' };
      expect(reducer(state, {})).to.equal(state);
    });

    describe('action: selectAnimation', function () {
      var selectAnimation = animationTabModule.selectAnimation;

      it('changes selected animation in state', function () {
        var newState = reducer(initialState, selectAnimation('animationKey'));
        expect(newState).not.to.equal(initialState);
        expect(newState).to.have.deep.property('selectedAnimation', 'animationKey');
      });

      it('does not change state if animation already selected', function () {
        var state = { columnSizes: [], selectedAnimation: 'anotherKey' };
        var newState = reducer(state, selectAnimation('anotherKey'));
        expect(newState).to.equal(state);
      });
    });

    describe('action: Game Lab ADD_ANIMATION_AT', function () {
      it('changes selected animation to newly added animation', function () {
        var action = {
          type: ADD_ANIMATION_AT,
          animationProps: {
            key: 'new_animation_key'
          }
        };
        var newState = reducer(initialState, action);
        expect(newState).not.to.equal(initialState);
        expect(newState).to.have.deep.property('selectedAnimation', 'new_animation_key');
      });
    });
  });
});
