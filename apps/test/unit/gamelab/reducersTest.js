var actions = require('@cdo/apps/gamelab/actions');
var createStore = require('../../util/redux').createStore;
var combineReducers = require('redux').combineReducers;
import {expect} from '../../util/configuredChai';
var _ = require('lodash');
var GameLabInterfaceMode = require('@cdo/apps/gamelab/constants').GameLabInterfaceMode;
var gamelabReducers = require('@cdo/apps/gamelab/reducers');
var commonReducers = require('@cdo/apps/redux/commonReducers');
var pageConstants = require('@cdo/apps/redux/pageConstants');

var testUtils = require('../../util/testUtils');

describe('gamelabReducer', function () {
  var store;
  var initialState;
  var CODE = GameLabInterfaceMode.CODE;
  var ANIMATION = GameLabInterfaceMode.ANIMATION;

  testUtils.setExternalGlobals();

  beforeEach(function () {
    store = createStore(combineReducers(_.assign({}, commonReducers, gamelabReducers)));
    initialState = store.getState();
  });

  it('has expected default state', function () {
    expect(initialState.interfaceMode).to.equal(CODE);
    expect(initialState.pageConstants).to.be.an.object;
    expect(initialState.pageConstants.assetUrl).to.be.a.function;
    expect(initialState.pageConstants.isEmbedView).to.be.undefined;
    expect(initialState.pageConstants.isShareView).to.be.undefined;
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

  describe('action: setPageConstants', function () {
    var setPageConstants = pageConstants.setPageConstants;

    it('allows setting assetUrl', function () {
      var newAssetUrlFunction = function () {};
      expect(initialState.pageConstants.assetUrl).to.not.equal(newAssetUrlFunction);
      store.dispatch(setPageConstants({
        assetUrl: newAssetUrlFunction
      }));
      expect(store.getState().pageConstants.assetUrl).to.equal(newAssetUrlFunction);
    });

    it('allows setting isEmbedView', function () {
      expect(initialState.pageConstants.isEmbedView).to.be.undefined;
      store.dispatch(setPageConstants({
        isEmbedView: false
      }));
      expect(store.getState().pageConstants.isEmbedView).to.be.false;
    });

    it('allows setting isShareView', function () {
      expect(initialState.pageConstants.isShareView).to.be.undefined;
      store.dispatch(setPageConstants({
        isShareView: true
      }));
      expect(store.getState().pageConstants.isShareView).to.be.true;
    });

    it('does not allow setting other properties', function () {
      expect(function () {
        store.dispatch(setPageConstants({
          theAnswer: 42
        }));
      }).to.throw(Error, /Property "theAnswer" may not be set using the pageConstants\/SET_PAGE_CONSTANTS action./);
    });

  });
});
