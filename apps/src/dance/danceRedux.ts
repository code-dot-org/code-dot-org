import {
  AnyAction,
  createAsyncThunk,
  createSlice,
  PayloadAction,
  ThunkDispatch,
} from '@reduxjs/toolkit';

import {queryParams} from '../code-studio/utils';
import {fetchSignedCookies} from '../utils';

import {DanceAiModalOutputType} from './ai/types';
import {
  getSongManifest,
  getSelectedSong,
  parseSongOptions,
  loadSong,
  unloadSong,
  loadSongMetadata,
  isSongDeprecated,
} from './songs';
import {SongData, SongMetadata} from './types';

export interface DanceState {
  selectedSong: string;
  songData: SongData;
  runIsStarting: boolean;
  currentAiModalBlockId: string | undefined;
  aiOutput?: DanceAiModalOutputType;
  aiModalOpenedFromFlyout: boolean;
  // Fields below are used only by Lab2 Dance
  /** If the program is currently running */
  isRunning: boolean;
  /** Metadata for the currently selected song */
  currentSongMetadata: SongMetadata | undefined;
  /** If a load is in progress */
  isLoading: boolean;
  hasRun: boolean;
}

const initialState: DanceState = {
  selectedSong: 'macklemore90',
  songData: {},
  runIsStarting: false,
  currentAiModalBlockId: undefined,
  aiOutput: DanceAiModalOutputType.AI_BLOCK,
  aiModalOpenedFromFlyout: false,
  isRunning: false,
  currentSongMetadata: undefined,
  isLoading: false,
  hasRun: false,
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
        songSelection?: Array<string>;
      };
      onAuthError: (songId: string) => void;
      onSongSelected?: (songId: string) => void;
      onSongUnavailable?: (songId: string) => void;
    },
    {dispatch}
  ) => {
    const {
      useRestrictedSongs,
      onAuthError,
      selectSongOptions,
      onSongSelected,
      onSongUnavailable,
    } = payload;

    // Check for a user-specified manifest file.
    const userManifest = queryParams('manifest') as string;

    // Build up a set from our song selection so we can filter our manifest later.
    const filteredSongSet = new Set(selectSongOptions.songSelection || []);

    const unfilteredSongManifest = await getSongManifest(
      useRestrictedSongs,
      userManifest
    );

    // a song should be included if we do NOT have a filtered song set
    // OR if we do have a set and our song's id is in them.
    let songManifest = unfilteredSongManifest.filter(
      (song: {id: string}) =>
        !filteredSongSet.size || filteredSongSet.has(song.id)
    );
    // Handle dev scenario where there's no overlap between
    // levelbuilder-configured songs and the list of dev-only songs
    if (!songManifest.length) {
      songManifest = unfilteredSongManifest;
    }
    const songData = parseSongOptions(songManifest) as SongData;

    if (
      selectSongOptions.selectedSong &&
      isSongDeprecated(selectSongOptions.selectedSong) &&
      onSongUnavailable
    ) {
      onSongUnavailable(selectSongOptions.selectedSong);
    }
    const selectedSong = getSelectedSong(songManifest, selectSongOptions);

    // Set selectedSong first, so we don't initially show the wrong song.
    dispatch(setSelectedSong(selectedSong));
    dispatch(setSongData(songData));

    loadSong(selectedSong, songData, (status: number) => {
      if (status === 403) {
        // Something is wrong, because we just fetched cloudfront credentials.
        onAuthError(selectedSong);
      }
    });

    await handleSongSelection(dispatch, selectedSong, onSongSelected);
  }
);

/** Called when a new song is selected. Unloads the previous song and loads the new song. */
export const setSong = createAsyncThunk(
  'dance/setSong',
  async (
    payload: {
      songId: string;
      onAuthError: (songId: string) => void;
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
        await fetchSignedCookies(true);
        loadSong(songId, songData, (status: number) => {
          if (status === 403) {
            // Something is wrong, because we just re-fetched cloudfront credentials.
            onAuthError(songId);
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
  // Temporary branching to support both legacy Dance which manages the current song's
  // manifest within Dance.js, and Lab2 Dance which reads the current song's manifest from Redux.
  if (onSongSelected) {
    onSongSelected(songId);
  }
  const metadata = await loadSongMetadata(songId);
  dispatch(setCurrentSongMetadata(metadata));
}

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
    setCurrentSongMetadata: (state, action: PayloadAction<SongMetadata>) => {
      state.currentSongMetadata = action.payload;
    },
    setAiOutput: (state, action: PayloadAction<DanceAiModalOutputType>) => {
      state.aiOutput = action.payload;
    },
    openAiModal: (
      state,
      action: PayloadAction<{
        blockId: string;
        fromFlyout: boolean;
      }>
    ) => {
      state.currentAiModalBlockId = action.payload.blockId;
      state.aiModalOpenedFromFlyout = action.payload.fromFlyout;
    },
    closeAiModal: state => {
      state.currentAiModalBlockId = undefined;
      state.aiModalOpenedFromFlyout = false;
    },
    setIsRunning: (state, action: PayloadAction<boolean>) => {
      state.isRunning = action.payload;
    },
    setHasRun: (state, action: PayloadAction<boolean>) => {
      state.hasRun = action.payload;
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
      // TODO: Handle error. Should we bubble this up to Lab2 and show the
      // error modal? Or should we handle internally and retry?
    });
    builder.addCase(setSong.pending, state => {
      state.isLoading = true;
    });
    builder.addCase(setSong.fulfilled, state => {
      state.isLoading = false;
    });
    builder.addCase(setSong.rejected, state => {
      state.isLoading = false;
      // TODO: Handle error. Should we bubble this up to Lab2 and show the
      // error modal? Or should we handle internally and retry?
    });
  },
});

export const {
  setSongData,
  setSelectedSong,
  setRunIsStarting,
  setCurrentSongMetadata,
  setAiOutput,
  openAiModal,
  closeAiModal,
  setIsRunning,
  setHasRun,
} = danceSlice.actions;
export const reducers = {dance: danceSlice.reducer};
