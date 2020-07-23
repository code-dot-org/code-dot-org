var createStore = require('../../util/redux').createStore;
import {expect} from '../../util/deprecatedChai';
import {reducers, setSelectedSong} from '../../../src/dance/redux';
var testUtils = require('../../util/testUtils');
var commonReducers = require('@cdo/apps/redux/commonReducers');
var combineReducers = require('redux').combineReducers;
var _ = require('lodash');

describe('danceReducer', function() {
  var store;
  var initialState;

  testUtils.setExternalGlobals();

  beforeEach(function() {
    store = createStore(
      combineReducers(_.assign({}, commonReducers, reducers))
    );
    initialState = store.getState();
  });

  it('has expected default state', function() {
    expect(initialState.songs.selectedSong).to.equal('macklemore90');
  });

  describe('action: selectedSong', function() {
    it('sets selection to given string', function() {
      expect(store.getState().songs.selectedSong).to.equal('macklemore90');
      store.dispatch(setSelectedSong('Alpha'));
      expect(store.getState().songs.selectedSong).to.equal('Alpha');
    });

    it('selection sets to most recent string', function() {
      store.dispatch(setSelectedSong('Beta'));
      store.dispatch(setSelectedSong('Gamma'));
      expect(store.getState().songs.selectedSong).to.equal('Gamma');
    });
  });
});
