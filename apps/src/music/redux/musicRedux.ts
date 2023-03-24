import {createSlice, PayloadAction} from '@reduxjs/toolkit';

const registerReducers = require('@cdo/apps/redux').registerReducers;

/**
 * State, reducer, and actions for Music Lab.
 */

enum InstructionsPosition {
  TOP = 'TOP',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT'
}

// Exporting enum as object for use in JS files
export const InstructionsPositions = {
  TOP: InstructionsPosition.TOP,
  LEFT: InstructionsPosition.LEFT,
  RIGHT: InstructionsPosition.RIGHT
};

export interface MusicState {
  isPlaying: boolean;
  currentPlayheadPosition: number;
  selectedBlockId: string | undefined;
  timelineAtTop: boolean;
  showInstructions: boolean;
  instructionsPosition: InstructionsPosition;
  isBeatPadShowing: boolean;
}

const initialState: MusicState = {
  isPlaying: false,
  currentPlayheadPosition: 0,
  selectedBlockId: undefined,
  timelineAtTop: false,
  showInstructions: false,
  instructionsPosition: InstructionsPosition.LEFT,
  isBeatPadShowing: false
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
    },
    toggleTimelinePosition: state => {
      state.timelineAtTop = !state.timelineAtTop;
    },
    setShowInstructions: (state, action: PayloadAction<boolean>) => {
      state.showInstructions = action.payload;
    },
    toggleInstructions: state => {
      state.showInstructions = !state.showInstructions;
    },
    setInstructionsPosition: (
      state,
      action: PayloadAction<InstructionsPosition>
    ) => {
      state.instructionsPosition = action.payload;
    },
    advanceInstructionsPosition: state => {
      const positions = Object.values(InstructionsPosition);
      state.instructionsPosition =
        positions[
          (positions.indexOf(state.instructionsPosition) + 1) % positions.length
        ];
    },
    showBeatPad: state => {
      state.isBeatPadShowing = true;
    },
    hideBeatPad: state => {
      state.isBeatPadShowing = false;
    },
    toggleBeatPad: state => {
      state.isBeatPadShowing = !state.isBeatPadShowing;
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
  clearSelectedBlockId,
  toggleTimelinePosition,
  setShowInstructions,
  setInstructionsPosition,
  toggleInstructions,
  advanceInstructionsPosition,
  showBeatPad,
  hideBeatPad,
  toggleBeatPad
} = musicSlice.actions;
