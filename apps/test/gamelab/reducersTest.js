var actions = require('@cdo/apps/gamelab/actions');
var createStore = require('@cdo/apps/redux');
var expect = require('chai').expect;
var GameLabInterfaceMode = require('@cdo/apps/gamelab/constants').GameLabInterfaceMode;
var gamelabReducer = require('@cdo/apps/gamelab/reducers').gamelabReducer;

describe('gamelabReducer', function () {
  var store;
  var initialState;
  var CODE = GameLabInterfaceMode.CODE;
  var ANIMATION = GameLabInterfaceMode.ANIMATION;

  beforeEach(function () {
    store = createStore(gamelabReducer);
    initialState = store.getState();
  });

  it('has expected default state', function () {
    expect(initialState.interfaceMode).to.equal(CODE);
    expect(initialState.level).to.be.an.object;
    expect(initialState.level.assetUrl).to.be.a.function;
    expect(initialState.level.isEmbedView).to.be.undefined;
    expect(initialState.level.isShareView).to.be.undefined;
  });

  describe('action: changeInterfaceMode', function () {
    var changeInterfaceMode = actions.changeInterfaceMode;

    it('returns original object when already in given mode', function () {
      expect(initialState.interfaceMode).to.equal(CODE);
      store.dispatch(changeInterfaceMode(CODE));
      var newState = store.getState();
      expect(newState).to.equal(initialState);
      expect(newState.interfaceMode).to.equal(CODE);
    });

    it('returns a new object when in a new mode', function () {
      expect(initialState.interfaceMode).to.equal(CODE);
      store.dispatch(changeInterfaceMode(ANIMATION));
      var newState = store.getState();
      expect(newState.interfaceMode).to.equal(ANIMATION);
      expect(newState).to.not.equal(initialState);
    });
  });

  describe('action: setInitialLevelProps', function () {
    var setInitialLevelProps = actions.setInitialLevelProps;

    it('allows setting assetUrl', function () {
      var newAssetUrlFunction = function () {};
      expect(initialState.level.assetUrl).to.not.equal(newAssetUrlFunction);
      store.dispatch(setInitialLevelProps({
        assetUrl: newAssetUrlFunction
      }));
      expect(store.getState().level.assetUrl).to.equal(newAssetUrlFunction);
    });

    it('allows setting isEmbedView', function () {
      expect(initialState.level.isEmbedView).to.be.undefined;
      store.dispatch(setInitialLevelProps({
        isEmbedView: false
      }));
      expect(store.getState().level.isEmbedView).to.be.false;
    });

    it('allows setting isShareView', function () {
      expect(initialState.level.isShareView).to.be.undefined;
      store.dispatch(setInitialLevelProps({
        isShareView: true
      }));
      expect(store.getState().level.isShareView).to.be.true;
    });

    it('does not allow setting other properties', function () {
      expect(function () {
        store.dispatch(setInitialLevelProps({
          theAnswer: 42
        }));
      }).to.throw(Error, /Property "theAnswer" may not be set using the SET_INITIAL_LEVEL_PROPS action./);
    });

  });
});
