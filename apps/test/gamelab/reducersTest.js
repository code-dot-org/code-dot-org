var actions = require('@cdo/apps/gamelab/actions');
var expect = require('chai').expect;
var GameLabInterfaceMode = require('@cdo/apps/gamelab/constants').GameLabInterfaceMode;
var gamelabReducer = require('@cdo/apps/gamelab/reducers').gamelabReducer;
var animationTabActions = require('@cdo/apps/gamelab/AnimationTab/actions');
var animationTabReducers = require('@cdo/apps/gamelab/AnimationTab/reducers');

describe('gamelabReducer', function () {
  var defaultState;
  var CODE = GameLabInterfaceMode.CODE;
  var ANIMATION = GameLabInterfaceMode.ANIMATION;

  beforeEach(function () {
    defaultState = gamelabReducer(undefined, {});
  });

  it('has expected default state', function () {
    expect(defaultState.interfaceMode).to.equal(CODE);
    expect(defaultState.level).to.be.an.object;
    expect(defaultState.level.assetUrl).to.be.a.function;
    expect(defaultState.level.isEmbedView).to.be.undefined;
    expect(defaultState.level.isShareView).to.be.undefined;
  });

  describe('action: changeInterfaceMode', function () {
    var changeInterfaceMode = actions.changeInterfaceMode;

    it('returns original object when already in given mode', function () {
      expect(defaultState.interfaceMode).to.equal(CODE);
      var newState = gamelabReducer(defaultState, changeInterfaceMode(CODE));
      expect(newState).to.equal(defaultState);
      expect(newState.interfaceMode).to.equal(CODE);
    });

    it('returns a new object when in a new mode', function () {
      expect(defaultState.interfaceMode).to.equal(CODE);
      var newState = gamelabReducer(defaultState, changeInterfaceMode(ANIMATION));
      expect(newState).to.not.equal(defaultState);
      expect(newState.interfaceMode).to.equal(ANIMATION);
    });
  });

  describe('action: setInitialLevelProps', function () {
    var setInitialLevelProps = actions.setInitialLevelProps;

    it('allows setting assetUrl', function () {
      var newAssetUrlFunction = function () {};
      expect(defaultState.level.assetUrl).to.not.equal(newAssetUrlFunction);
      var newState = gamelabReducer(defaultState, setInitialLevelProps({
        assetUrl: newAssetUrlFunction
      }));
      expect(newState.level.assetUrl).to.equal(newAssetUrlFunction);
    });

    it('allows setting isEmbedView', function () {
      expect(defaultState.level.isEmbedView).to.be.undefined;
      var newState = gamelabReducer(defaultState, setInitialLevelProps({
        isEmbedView: false
      }));
      expect(newState.level.isEmbedView).to.be.false;
    });

    it('allows setting isShareView', function () {
      expect(defaultState.level.isShareView).to.be.undefined;
      var newState = gamelabReducer(defaultState, setInitialLevelProps({
        isShareView: true
      }));
      expect(newState.level.isShareView).to.be.true;
    });

    it('does not allow setting other properties', function () {
      expect(function () {
        gamelabReducer(defaultState, setInitialLevelProps({
          theAnswer: 42
        }));
      }).to.throw(Error, /Property "theAnswer" may not be set using the SET_INITIAL_LEVEL_PROPS action./);
    });

  });
});

describe('errorStack', function () {
  var errorStack = animationTabReducers.errorStack;

  it('has empty array as default state', function () {
    expect(errorStack(undefined, {})).to.deep.equal([]);
  });

  it('returns original state on unhandled action', function () {
    var state = [];
    expect(errorStack(state, {})).to.equal(state);
  });

  describe('action: reportError', function () {
    var reportError = animationTabActions.reportError;

    it('pushes an error object onto the stack', function () {
      var state = [];
      var newState = errorStack([], reportError('a mistake'));
      expect(newState).not.to.equal(state);
      expect(newState).to.deep.equal([
        { message: 'a mistake' }
      ]);
    });

    it('puts the new error object at the beginning of the stack', function () {
      var state = [{ message: 'original' }];
      var newState = errorStack(state, reportError('new'));
      expect(newState).not.to.equal(state);
      expect(newState).to.deep.equal([
        { message: 'new' },
        { message: 'original' }
      ]);
    });
  });

  describe('action: DISMISS_ERROR', function () {
    var dismissError = animationTabActions.dismissError;

    it('removes the first error object from the stack', function () {
      var state = [
        { message: 'first' },
        { message: 'second' }
      ];
      var newState = errorStack(state, dismissError());
      expect(newState).not.to.equal(state);
      expect(newState).to.deep.equal([
        { message: 'second' }
      ]);
    });

    it('does nothing when stack is already empty', function () {
      var state = [];
      var newState = errorStack(state, dismissError());
      expect(newState).to.equal(state);
    });
  });
});
