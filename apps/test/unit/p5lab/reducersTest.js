var _ = require('lodash');
var combineReducers = require('redux').combineReducers;

var actions = require('@cdo/apps/p5lab/actions');
var P5LabInterfaceMode =
  require('@cdo/apps/p5lab/constants').P5LabInterfaceMode;
var gamelabReducers = require('@cdo/apps/p5lab/reducers');
var {
  clearConsole,
  addConsoleMessage,
} = require('@cdo/apps/p5lab/redux/textConsole');
var commonReducers = require('@cdo/apps/redux/commonReducers');
var pageConstants = require('@cdo/apps/redux/pageConstants');

var createStore = require('../../util/redux').createStore;
var testUtils = require('../../util/testUtils');

describe('gamelabReducer', function () {
  var store;
  var initialState;
  var CODE = P5LabInterfaceMode.CODE;
  var ANIMATION = P5LabInterfaceMode.ANIMATION;

  testUtils.setExternalGlobals();

  beforeEach(function () {
    store = createStore(
      combineReducers(_.assign({}, commonReducers, gamelabReducers))
    );
    initialState = store.getState();
  });

  it('has expected default state', function () {
    expect(initialState.interfaceMode).toBe(CODE);
    expect(initialState.pageConstants).toBeInstanceOf(Object);
    expect(initialState.pageConstants.assetUrl).toBeInstanceOf(Function);
    expect(initialState.pageConstants.isEmbedView).toBeUndefined();
    expect(initialState.pageConstants.isShareView).toBeUndefined();
    expect(initialState.textConsole).toHaveLength(0);
  });

  describe('action: addConsoleMessage', () => {
    let initialMessage = {name: 'hello', text: 'world'};
    beforeEach(() => {
      store.dispatch(addConsoleMessage(initialMessage));
    });

    it('adds a message to the list of messages', () => {
      expect(store.getState().textConsole).toEqual([initialMessage]);
    });

    it('appends a new message to the end of the list', () => {
      let secondMessage = {name: 'foo', text: 'bar'};
      store.dispatch(addConsoleMessage(secondMessage));
      expect(store.getState().textConsole).toEqual([
        initialMessage,
        secondMessage,
      ]);
    });

    it('is cleared by action: clearConsole', () => {
      store.dispatch(clearConsole());
      expect(store.getState().textConsole).toHaveLength(0);
    });
  });

  describe('action: changeInterfaceMode', function () {
    var changeInterfaceMode = actions.changeInterfaceMode;

    it('returns object with same values when already in given mode', function () {
      expect(initialState.interfaceMode).toBe(CODE);
      store.dispatch(changeInterfaceMode(CODE));
      var newState = store.getState();
      expect(newState).toEqual(initialState);
      expect(newState.interfaceMode).toBe(CODE);
    });

    it('returns object with updated values when in a new mode', function () {
      expect(initialState.interfaceMode).toBe(CODE);
      expect(initialState.instructions.allowResize).toBe(true);
      store.dispatch(changeInterfaceMode(ANIMATION));
      var newState = store.getState();
      expect(newState.interfaceMode).toBe(ANIMATION);
      expect(newState.instructions.allowResize).toBe(false);
    });
  });

  describe('action: setPageConstants', function () {
    var setPageConstants = pageConstants.setPageConstants;

    it('allows setting assetUrl', function () {
      var newAssetUrlFunction = function () {};
      expect(initialState.pageConstants.assetUrl).not.toBe(newAssetUrlFunction);
      store.dispatch(
        setPageConstants({
          assetUrl: newAssetUrlFunction,
        })
      );
      expect(store.getState().pageConstants.assetUrl).toBe(newAssetUrlFunction);
    });

    it('allows setting isEmbedView', function () {
      expect(initialState.pageConstants.isEmbedView).toBeUndefined();
      store.dispatch(
        setPageConstants({
          isEmbedView: false,
        })
      );
      expect(store.getState().pageConstants.isEmbedView).toBe(false);
    });

    it('allows setting isShareView', function () {
      expect(initialState.pageConstants.isShareView).toBeUndefined();
      store.dispatch(
        setPageConstants({
          isShareView: true,
        })
      );
      expect(store.getState().pageConstants.isShareView).toBe(true);
    });

    it('does not allow setting other properties', function () {
      expect(function () {
        store.dispatch(
          setPageConstants({
            theAnswer: 42,
          })
        );
      }).toThrow(Error);
    });
  });
});
