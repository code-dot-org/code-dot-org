import {createSlice, PayloadAction} from '@reduxjs/toolkit';

const registerReducers = require('@cdo/apps/redux').registerReducers;

/**
 * State, reducer, and actions for Music Lab.
 */

interface MusicState {
  isPlaying: boolean;
  currentPlayheadPosition: number;
}

const initialState: MusicState = {
  isPlaying: false,
  currentPlayheadPosition: 0
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
    }
  }
});

// TODO: If/when a top-level component is created that wraps {@link MusicView}, then
// registering reducers should happen there. We are registering reducers here for now
// because MusicView is currently the top-level entrypoint into Music Lab and also needs
// to be connected to this state.
registerReducers({music: musicSlice.reducer});

export const {setIsPlaying, setCurrentPlayheadPosition} = musicSlice.actions;
