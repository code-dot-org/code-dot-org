import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {SongData} from './types';
import {queryParams} from '../code-studio/utils';
import {fetchSignedCookies} from '../utils';
import {
  getSongManifest,
  getSelectedSong,
  parseSongOptions,
  loadSong,
  unloadSong,
} from './songs';

export interface DanceState {
  selectedSong: string;
  songData: SongData;
  runIsStarting: boolean;
}

const initialState: DanceState = {
  selectedSong: 'macklemore90',
  songData: {},
  runIsStarting: false,
};

// THUNKS

/** Loads the song manifest and initial song. */
export const initSongs = createAsyncThunk(
  'dance/initSongs',
  async (
    payload: {
      useRestrictedSongs: boolean;
      selectSongOptions: {
        selectedSong?: string;
        defaultSong?: string;
        isProjectLevel: boolean;
        freePlay: boolean;
      };
      onAuthError: () => void;
      onSongSelected?: (songId: string) => void;
    },
    {dispatch}
  ) => {
    const {useRestrictedSongs, onAuthError, selectSongOptions, onSongSelected} =
      payload;

    // Check for a user-specified manifest file.
    const userManifest = queryParams('manifest') as string;
    const songManifest = await getSongManifest(
      useRestrictedSongs,
      userManifest
    );
    const songData = parseSongOptions(songManifest) as SongData;
    const selectedSong = getSelectedSong(songManifest, selectSongOptions);

    // Set selectedSong first, so we don't initially show the wrong song.
    dispatch(setSelectedSong(selectedSong));
    dispatch(setSongData(songData));

    loadSong(selectedSong, songData, (status: number) => {
      if (status === 403) {
        // Something is wrong, because we just fetched cloudfront credentials.
        onAuthError();
      }
    });

    if (onSongSelected) {
      onSongSelected(selectedSong);
    }
  }
);

/** Called when a new song is selected. Unloads the previous song and loads the new song. */
export const setSong = createAsyncThunk(
  'dance/setSong',
  async (
    payload: {
      songId: string;
      onAuthError: () => void;
      onSongSelected?: (songId: string) => void;
    },
    {dispatch, getState}
  ) => {
    const {songId, onAuthError, onSongSelected} = payload;
    const state = getState() as {dance: DanceState};
    const {selectedSong: lastSongId, songData} = state.dance;

    if (songId === lastSongId) {
      return;
    }

    dispatch(setSelectedSong(songId));
    unloadSong(lastSongId, songData);

    loadSong(songId, songData, async (status: number) => {
      if (status === 403) {
        // The cloudfront signed cookies may have expired.
        await fetchSignedCookies();
        loadSong(songId, songData, (status: number) => {
          if (status === 403) {
            // Something is wrong, because we just re-fetched cloudfront credentials.
            onAuthError();
          }
        });
      }
    });

    if (onSongSelected) {
      onSongSelected(songId);
    }
  }
);

const danceSlice = createSlice({
  name: 'dance',
  initialState,
  reducers: {
    setSongData: (state, action: PayloadAction<SongData>) => {
      state.songData = action.payload;
    },
    setSelectedSong: (state, action: PayloadAction<string>) => {
      state.selectedSong = action.payload;
    },
    setRunIsStarting: (state, action: PayloadAction<boolean>) => {
      state.runIsStarting = action.payload;
    },
  },
});

export const {setSongData, setSelectedSong, setRunIsStarting} =
  danceSlice.actions;
export const reducers = {dance: danceSlice.reducer};
