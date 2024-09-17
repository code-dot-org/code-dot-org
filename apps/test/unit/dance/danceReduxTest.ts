import {assert} from 'chai'; // eslint-disable-line no-restricted-imports
import {combineReducers, Store} from 'redux';
import Sinon from 'sinon'; // eslint-disable-line no-restricted-imports
import {StubFunction} from 'test/types/types';

import * as codeStudioUtils from '@cdo/apps/code-studio/utils';
import {
  DanceState,
  initSongs,
  reducers,
  setSelectedSong,
  setSong,
  setSongData,
} from '@cdo/apps/dance/danceRedux';
import * as songs from '@cdo/apps/dance/songs';
import {SongData, SongMetadata} from '@cdo/apps/dance/types';
import * as commonReducers from '@cdo/apps/redux/commonReducers';
import {AppDispatch} from '@cdo/apps/util/reduxHooks';
import * as utils from '@cdo/apps/utils';

import {expect} from '../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports
import {createStore} from '../../util/redux';
import {setExternalGlobals} from '../../util/testUtils';

describe('danceRedux', function () {
  let store: Store;
  let initialState: {dance: DanceState};

  setExternalGlobals();

  beforeEach(() => {
    store = createStore(combineReducers({...commonReducers, ...reducers}));
    initialState = store.getState();
  });

  it('has expected default state', function () {
    expect(initialState.dance.selectedSong).to.equal('macklemore90');
  });

  describe('action: selectedSong', () => {
    it('sets selection to given string', function () {
      expect(store.getState().dance.selectedSong).to.equal('macklemore90');
      store.dispatch(setSelectedSong('Alpha'));
      expect(store.getState().dance.selectedSong).to.equal('Alpha');
    });

    it('selection sets to most recent string', () => {
      store.dispatch(setSelectedSong('Beta'));
      store.dispatch(setSelectedSong('Gamma'));
      expect(store.getState().dance.selectedSong).to.equal('Gamma');
    });
  });

  describe('Thunks', () => {
    let dispatch: AppDispatch,
      useRestrictedSongs: boolean,
      isProjectLevel: boolean,
      freePlay: boolean,
      defaultSong: string,
      selectedSong: string,
      songData: SongData,
      songMetadata: SongMetadata,
      queryParams: StubFunction<typeof codeStudioUtils.queryParams>,
      parseSongOptions: StubFunction<typeof songs.parseSongOptions>,
      getSelectedSong: StubFunction<typeof songs.getSelectedSong>,
      getSongManifest: StubFunction<typeof songs.getSongManifest>,
      loadSong: StubFunction<typeof songs.loadSong>,
      unloadSong: StubFunction<typeof songs.unloadSong>,
      fetchSignedCookies: StubFunction<typeof utils.fetchSignedCookies>,
      loadSongMetadata: StubFunction<typeof songs.loadSongMetadata>,
      onSongSelected: StubFunction<(songId: string) => void>,
      onAuthError: StubFunction<() => void>,
      userManifest: string,
      songManifest: object;

    beforeEach(() => {
      dispatch = store.dispatch as AppDispatch;
      useRestrictedSongs = true;
      isProjectLevel = false;
      freePlay = false;
      defaultSong = 'default';
      selectedSong = 'selected';
      songData = {};
      songMetadata = {
        analysis: [],
        artist: 'test',
        bpm: '120',
        delay: '0',
        duration: 1,
        file: 'test',
        title: 'test',
        peaks: {},
      };

      parseSongOptions = Sinon.stub(songs, 'parseSongOptions');
      getSelectedSong = Sinon.stub(songs, 'getSelectedSong');
      getSongManifest = Sinon.stub(songs, 'getSongManifest');
      loadSong = Sinon.stub(songs, 'loadSong');
      unloadSong = Sinon.stub(songs, 'unloadSong');
      fetchSignedCookies = Sinon.stub(utils, 'fetchSignedCookies');
      onSongSelected = Sinon.stub();
      queryParams = Sinon.stub(codeStudioUtils, 'queryParams');
      onAuthError = Sinon.stub<[], void>();
      loadSongMetadata = Sinon.stub(songs, 'loadSongMetadata');

      userManifest = 'user-manifest';
      queryParams.returns(userManifest);

      songManifest = [{id: 'a'}, {id: 'b'}, {id: 'c'}];
      getSongManifest.returns(new Promise(resolve => resolve(songManifest)));

      parseSongOptions.returns(songData);
      getSelectedSong.returns(selectedSong);
      loadSongMetadata.returns(new Promise(resolve => resolve(songMetadata)));
    });

    afterEach(() => {
      Sinon.restore();
    });

    describe('initSongs', () => {
      it('initializes songs correctly', async () => {
        const selectSongOptions = {
          isProjectLevel,
          freePlay,
          defaultSong,
          selectedSong,
        };
        await dispatch(
          initSongs({
            useRestrictedSongs,
            selectSongOptions,
            onAuthError,
            onSongSelected,
          })
        );

        assert.isTrue(queryParams.calledWithExactly('manifest'));
        assert.isTrue(
          getSongManifest.calledWithExactly(useRestrictedSongs, userManifest)
        );
        assert.isTrue(parseSongOptions.calledWithExactly(songManifest));
        assert.isTrue(
          getSelectedSong.calledWithExactly(songManifest, selectSongOptions)
        );
        assert.isTrue(loadSong.calledWith(selectedSong));
        assert.isTrue(onSongSelected.calledWithExactly(selectedSong));

        assert.deepEqual(store.getState().dance.songData, songData);
        assert.deepEqual(store.getState().dance.selectedSong, selectedSong);
      });

      it('initializes filtered songs correctly', async () => {
        const selectSongOptions = {
          isProjectLevel,
          freePlay,
          defaultSong,
          selectedSong,
          songSelection: ['a'],
        };
        await dispatch(
          initSongs({
            useRestrictedSongs,
            selectSongOptions,
            onAuthError,
            onSongSelected,
          })
        );

        assert.isTrue(queryParams.calledWithExactly('manifest'));
        assert.isTrue(
          getSongManifest.calledWithExactly(useRestrictedSongs, userManifest)
        );
        assert.isTrue(parseSongOptions.calledWithExactly([{id: 'a'}]));
        assert.isTrue(
          getSelectedSong.calledWithExactly([{id: 'a'}], selectSongOptions)
        );
        assert.isTrue(loadSong.calledWith(selectedSong));
        assert.isTrue(onSongSelected.calledWithExactly(selectedSong));

        assert.deepEqual(store.getState().dance.songData, songData);
        assert.deepEqual(store.getState().dance.selectedSong, selectedSong);
      });

      it('calls auth error if song loading fails with 403', async () => {
        await dispatch(
          initSongs({
            useRestrictedSongs,
            selectSongOptions: {
              isProjectLevel,
              freePlay,
              defaultSong,
              selectedSong,
            },
            onAuthError,
            onSongSelected,
          })
        );

        assert.isTrue(loadSong.calledOnce);
        const errorCallback = loadSong.firstCall.args[2];
        errorCallback(403);
        assert.isTrue(onAuthError.calledOnce);

        // Should not call auth error if status is not 403
        onAuthError.reset();
        errorCallback(500);
        assert.isFalse(onAuthError.called);
      });

      it('sets song metadata if no songSelected callback is supplied', async () => {
        await dispatch(
          initSongs({
            useRestrictedSongs,
            selectSongOptions: {
              isProjectLevel,
              freePlay,
              defaultSong,
              selectedSong,
            },
            onAuthError,
          })
        );

        assert.isTrue(loadSongMetadata.calledWithExactly(selectedSong));
        assert.deepEqual(
          store.getState().dance.currentSongMetadata,
          songMetadata
        );
      });
    });

    describe('setSong', () => {
      const songId = 'songId';
      const lastSongId = 'lastSongId';

      it('sets song correctly', async () => {
        dispatch(setSelectedSong(lastSongId));
        dispatch(setSongData(songData));
        await dispatch(
          setSong({
            songId,
            onAuthError,
            onSongSelected,
          })
        );

        assert.isTrue(unloadSong.calledWithExactly(lastSongId, songData));
        assert.isTrue(loadSong.calledWith(songId, songData));
        assert.isTrue(onSongSelected.calledWithExactly(songId));
        assert.equal(store.getState().dance.selectedSong, songId);
      });

      it('does nothing if the same song was selected', async () => {
        dispatch(setSelectedSong(songId));
        dispatch(setSongData(songData));
        await dispatch(
          setSong({
            songId,
            onAuthError,
            onSongSelected,
          })
        );

        assert.isFalse(unloadSong.called);
        assert.isFalse(loadSong.called);
        assert.equal(store.getState().dance.selectedSong, songId);
      });

      it('retries auth errors once, and then calls error callback', async () => {
        dispatch(setSelectedSong(lastSongId));
        dispatch(setSongData(songData));
        await dispatch(
          setSong({
            songId,
            onAuthError,
            onSongSelected,
          })
        );

        assert.isTrue(loadSong.calledOnce);

        // Should retry fetching cookies once on first auth error
        const firstCallback = loadSong.firstCall.args[2];
        await firstCallback(403);
        assert.isTrue(fetchSignedCookies.calledOnce);
        assert.isTrue(loadSong.calledTwice);

        // Should call error callback on second error
        const secondCallback = loadSong.secondCall.args[2];
        secondCallback(403);
        assert.isTrue(onAuthError.calledOnce);

        // Should not call error callback if status is not 403
        onAuthError.reset();
        secondCallback(500);
        assert.isFalse(onAuthError.called);
      });

      it('sets song metadata if no songSelected callback is supplied', async () => {
        dispatch(setSelectedSong(lastSongId));
        dispatch(setSongData(songData));
        await dispatch(
          setSong({
            songId,
            onAuthError,
          })
        );

        assert.isTrue(loadSongMetadata.calledWithExactly(songId));
        assert.deepEqual(
          store.getState().dance.currentSongMetadata,
          songMetadata
        );
      });
    });
  });
});
