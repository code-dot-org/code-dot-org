var actions = require('@cdo/apps/p5lab/actions');
var {
  clearConsole,
  addConsoleMessage
} = require('@cdo/apps/p5lab/redux/textConsole');
var createStore = require('../../util/redux').createStore;
var combineReducers = require('redux').combineReducers;
import {expect} from '../../util/deprecatedChai';
var _ = require('lodash');
var P5LabInterfaceMode = require('@cdo/apps/p5lab/constants')
  .P5LabInterfaceMode;
var gamelabReducers = require('@cdo/apps/p5lab/reducers');
var commonReducers = require('@cdo/apps/redux/commonReducers');
var pageConstants = require('@cdo/apps/redux/pageConstants');

var testUtils = require('../../util/testUtils');

describe('gamelabReducer', function() {
  var store;
  var initialState;
  var CODE = P5LabInterfaceMode.CODE;
  var ANIMATION = P5LabInterfaceMode.ANIMATION;

  testUtils.setExternalGlobals();

  beforeEach(function() {
    store = createStore(
      combineReducers(_.assign({}, commonReducers, gamelabReducers))
    );
    initialState = store.getState();
  });

  it('has expected default state', function() {
    expect(initialState.interfaceMode).to.equal(CODE);
    expect(initialState.pageConstants).to.be.an('object');
    expect(initialState.pageConstants.assetUrl).to.be.a('function');
    expect(initialState.pageConstants.isEmbedView).to.be.undefined;
    expect(initialState.pageConstants.isShareView).to.be.undefined;
    expect(initialState.textConsole).to.be.empty;
  });

  describe('action: addConsoleMessage', () => {
    let initialMessage = {name: 'hello', text: 'world'};
    beforeEach(() => {
      store.dispatch(addConsoleMessage(initialMessage));
    });

    it('adds a message to the list of messages', () => {
      expect(store.getState().textConsole).to.deep.equal([initialMessage]);
    });

    it('appends a new message to the end of the list', () => {
      let secondMessage = {name: 'foo', text: 'bar'};
      store.dispatch(addConsoleMessage(secondMessage));
      expect(store.getState().textConsole).to.deep.equal([
        initialMessage,
        secondMessage
      ]);
    });

    it('is cleared by action: clearConsole', () => {
      store.dispatch(clearConsole());
      expect(store.getState().textConsole).to.be.empty;
    });
  });

  describe('action: changeInterfaceMode', function() {
    var changeInterfaceMode = actions.changeInterfaceMode;

    it('returns object with same values when already in given mode', function() {
      expect(initialState.interfaceMode).to.equal(CODE);
      store.dispatch(changeInterfaceMode(CODE));
      var newState = store.getState();
      expect(newState).to.deep.equal(initialState);
      expect(newState.interfaceMode).to.equal(CODE);
    });

    it('returns object with updated values when in a new mode', function() {
      expect(initialState.interfaceMode).to.equal(CODE);
      expect(initialState.instructions.allowResize).to.equal(true);
      store.dispatch(changeInterfaceMode(ANIMATION));
      var newState = store.getState();
      expect(newState.interfaceMode).to.equal(ANIMATION);
      expect(newState.instructions.allowResize).to.equal(false);
    });
  });

  describe('action: setPageConstants', function() {
    var setPageConstants = pageConstants.setPageConstants;

    it('allows setting assetUrl', function() {
      var newAssetUrlFunction = function() {};
      expect(initialState.pageConstants.assetUrl).to.not.equal(
        newAssetUrlFunction
      );
      store.dispatch(
        setPageConstants({
          assetUrl: newAssetUrlFunction
        })
      );
      expect(store.getState().pageConstants.assetUrl).to.equal(
        newAssetUrlFunction
      );
    });

    it('allows setting isEmbedView', function() {
      expect(initialState.pageConstants.isEmbedView).to.be.undefined;
      store.dispatch(
        setPageConstants({
          isEmbedView: false
        })
      );
      expect(store.getState().pageConstants.isEmbedView).to.be.false;
    });

    it('allows setting isShareView', function() {
      expect(initialState.pageConstants.isShareView).to.be.undefined;
      store.dispatch(
        setPageConstants({
          isShareView: true
        })
      );
      expect(store.getState().pageConstants.isShareView).to.be.true;
    });

    it('does not allow setting other properties', function() {
      expect(function() {
        store.dispatch(
          setPageConstants({
            theAnswer: 42
          })
        );
      }).to.throw(
        Error,
        /Property "theAnswer" may not be set using the pageConstants\/SET_PAGE_CONSTANTS action./
      );
    });
  });
});
