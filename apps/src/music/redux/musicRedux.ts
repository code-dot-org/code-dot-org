import {createSlice, PayloadAction} from '@reduxjs/toolkit';

const registerReducers = require('@cdo/apps/redux').registerReducers;

/**
 * State, reducer, and actions for Music Lab.
 */

interface MusicState {
  isPlaying: boolean;
  currentPlayheadPosition: number;
  selectedBlockId: string | undefined;
}

const initialState: MusicState = {
  isPlaying: false,
  currentPlayheadPosition: 0,
  selectedBlockId: undefined
};

const musicSlice = createSlice({
  name: 'music',
  initialState,
  reducers: {
    setIsPlaying: (state, action: PayloadAction<boolean>) => {
      state.isPlaying = action.payload;
    },
    setCurrentPlayheadPosition: (state, action: PayloadAction<number>) => {
      state.currentPlayheadPosition = action.payload;
    },
    // If the user selects a block ID by clicking a timeline element, then
    // set the selected block ID.
    // If the user selects the currently-selected block ID, then unselect it.
    // If undefined is provided, we'll unselect all blocks.
    // During playback, we are dynamically highlighting blocks which overrides
    // the selection, so just do nothing here.
    selectBlockId: (state, action: PayloadAction<string>) => {
      if (state.isPlaying) {
        return;
      }

      if (state.selectedBlockId === action.payload) {
        state.selectedBlockId = undefined;
      } else {
        state.selectedBlockId = action.payload;
      }
    },
    clearSelectedBlockId: state => {
      state.selectedBlockId = undefined;
    }
  }
});

// TODO: If/when a top-level component is created that wraps {@link MusicView}, then
// registering reducers should happen there. We are registering reducers here for now
// because MusicView is currently the top-level entrypoint into Music Lab and also needs
// to be connected to this state.
registerReducers({music: musicSlice.reducer});

export const {
  setIsPlaying,
  setCurrentPlayheadPosition,
  selectBlockId,
  clearSelectedBlockId
} = musicSlice.actions;
