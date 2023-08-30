import {
  AnyAction,
  createAsyncThunk,
  createSlice,
  PayloadAction,
  ThunkDispatch,
} from '@reduxjs/toolkit';
import {SongData, SongMetadata} from './types';
import {
  unloadSong,
  loadSong,
  loadSongMetadata,
  getSongManifest,
  parseSongOptions,
  getSelectedSong,
} from './songs';
import {fetchSignedCookies} from '../utils';
import {queryParams} from '@cdo/apps/code-studio/utils';

export interface DanceSongState {
  selectedSong: string;
  songData: SongData;
  runIsStarting: boolean;
  // The remaining fields are used by Lab2 Dance. In legacy Dance, this is handled in Dance.js
  isLoading: boolean;
  isRunning: boolean;
  currentSongMetadata: SongMetadata | undefined;
  runQueued: boolean;
}

const initialState: DanceSongState = {
  selectedSong: 'macklemore90',
  songData: {},
  runIsStarting: false,
  isLoading: false,
  isRunning: false,
  currentSongMetadata: undefined,
  runQueued: false,
};

// THUNKS
export const initSongs = createAsyncThunk(
  'songs/initSongs',
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

    await handleSongSelection(dispatch, selectedSong, onSongSelected);
  }
);

export const setSong = createAsyncThunk(
  'songs/setSong',
  async (
    payload: {
      songId: string;
      onAuthError: () => void;
      onSongSelected?: (songId: string) => void;
    },
    {dispatch, getState}
  ) => {
    const {songId, onAuthError, onSongSelected} = payload;
    const state = getState() as {songs: DanceSongState};
    const {selectedSong: lastSongId, songData} = state.songs;

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

    await handleSongSelection(dispatch, songId, onSongSelected);
  }
);

async function handleSongSelection(
  dispatch: ThunkDispatch<unknown, unknown, AnyAction>,
  songId: string,
  onSongSelected?: (songId: string) => void
) {
  // Temporary branching to support both legacy Dance which manages the manifest within
  // Dance.js, and Lab2 Dance which reads the manifest from Redux.
  if (onSongSelected) {
    onSongSelected(songId);
  } else {
    const metadata = await loadSongMetadata(songId);
    dispatch(setCurrentSongMetadata(metadata));
  }
}

const songsSlice = createSlice({
  name: 'songs',
  initialState,
  reducers: {
    setSelectedSong(state, action: PayloadAction<string>) {
      state.selectedSong = action.payload;
    },
    setSongData(state, action: PayloadAction<SongData>) {
      state.songData = action.payload;
    },
    setRunIsStarting(state, action: PayloadAction<boolean>) {
      state.runIsStarting = action.payload;
    },
    setCurrentSongMetadata(state, action: PayloadAction<SongMetadata>) {
      state.currentSongMetadata = action.payload;
    },
    setIsRunning(state, action: PayloadAction<boolean>) {
      state.isRunning = action.payload;
      state.runQueued = false;
    },
    queueRun(state) {
      state.runQueued = true;
    },
    setIsLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
  },
  extraReducers: builder => {
    builder.addCase(initSongs.pending, state => {
      state.isLoading = true;
    });
    builder.addCase(initSongs.fulfilled, state => {
      state.isLoading = false;
    });
    builder.addCase(initSongs.rejected, state => {
      state.isLoading = false;
      // TODO: error
    });
    builder.addCase(setSong.pending, state => {
      state.isLoading = true;
    });
    builder.addCase(setSong.fulfilled, state => {
      state.isLoading = false;
    });
    builder.addCase(setSong.rejected, state => {
      state.isLoading = false;
      // TODO: error
    });
  },
});

export const reducers = {
  songs: songsSlice.reducer,
};

export const {
  setSelectedSong,
  setSongData,
  setRunIsStarting,
  setCurrentSongMetadata,
  setIsRunning,
  queueRun,
  setIsLoading,
} = songsSlice.actions;
