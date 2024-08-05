var animationTab = require('@cdo/apps/p5lab/redux/animationTab');

describe('AnimationTab', function () {
  describe('reducer', function () {
    var reducer = animationTab.default;
    var initialState = {
      columnSizes: [150, undefined],
      currentAnimations: {ANIMATION: '', BACKGROUND: ''},
    };

    it('has expected initial state', function () {
      expect(reducer(undefined, {})).toEqual(initialState);
    });

    it('returns original state on unhandled action', function () {
      var state = {
        columnSizes: [150, undefined],
        currentAnimations: {ANIMATION: 'whatever', BACKGROUND: ''},
      };
      expect(reducer(state, {})).toBe(state);
    });

    describe('action: selectAnimation', function () {
      var selectAnimation = animationTab.selectAnimation;

      it('changes selected animation in state', function () {
        var newState = reducer(initialState, selectAnimation('animationKey'));
        expect(newState).not.toBe(initialState);
        expect(newState).toHaveProperty(
          'currentAnimations.ANIMATION',
          'animationKey'
        );
      });

      it('does not change state if animation already selected', function () {
        var state = {
          columnSizes: [150, undefined],
          currentAnimations: {ANIMATION: 'anotherKey', BACKGROUND: ''},
        };
        var newState = reducer(state, selectAnimation('anotherKey'));
        expect(newState).toEqual(state);
      });
    });

    describe('action: selectBackground', function () {
      var selectBackground = animationTab.selectBackground;

      it('changes selected background in state', function () {
        var newState = reducer(initialState, selectBackground('backgroundKey'));
        expect(newState).not.toBe(initialState);
        expect(newState).toHaveProperty(
          'currentAnimations.BACKGROUND',
          'backgroundKey'
        );
      });

      it('does not change state if background already selected', function () {
        var state = {
          columnSizes: [150, undefined],
          currentAnimations: {ANIMATION: '', BACKGROUND: 'anotherKey'},
        };
        var newState = reducer(state, selectBackground('anotherKey'));
        expect(newState).toEqual(state);
      });
    });
  });
});
