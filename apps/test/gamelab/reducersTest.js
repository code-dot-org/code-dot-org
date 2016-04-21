var actions = require('@cdo/apps/gamelab/actions');
var expect = require('chai').expect;
var GameLabInterfaceMode = require('@cdo/apps/gamelab/constants').GameLabInterfaceMode;
var gamelabReducer = require('@cdo/apps/gamelab/reducers').gamelabReducer;

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
