import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {PlaybackEvent} from '../player/interfaces/PlaybackEvent';
import {initialProgressState, ProgressState} from '../progress/ProgressManager';

const registerReducers = require('@cdo/apps/redux').registerReducers;

/**
 * State, reducer, and actions for Music Lab.
 */

enum InstructionsPosition {
  TOP = 'TOP',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

// Exporting enum as object for use in JS files
export const InstructionsPositions = {
  TOP: InstructionsPosition.TOP,
  LEFT: InstructionsPosition.LEFT,
  RIGHT: InstructionsPosition.RIGHT,
};

interface MusicState {
  isPlaying: boolean;
  currentPlayheadPosition: number;
  selectedBlockId: string | undefined;
  timelineAtTop: boolean;
  showInstructions: boolean;
  instructionsPosition: InstructionsPosition;
  isBeatPadShowing: boolean;
  playbackEvents: PlaybackEvent[];
  lastMeasure: number;
  // TODO: Currently Music Lab is the only Lab that uses
  // this progres system, but in the future, we may want to
  // move this into a more generic, high-level, lab-agnostic
  // reducer.
  currentProgressState: ProgressState;
}

const initialState: MusicState = {
  isPlaying: false,
  currentPlayheadPosition: 0,
  selectedBlockId: undefined,
  timelineAtTop: false,
  showInstructions: false,
  instructionsPosition: InstructionsPosition.LEFT,
  isBeatPadShowing: false,
  playbackEvents: [],
  lastMeasure: 0,
  currentProgressState: {...initialProgressState},
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
    },
    setCurrentProgressState: (state, action: PayloadAction<ProgressState>) => {
      state.currentProgressState = {...action.payload};
    },
    clearPlaybackEvents: state => {
      state.playbackEvents = [];
      state.lastMeasure = 0;
    },
    addPlaybackEvents: (
      state,
      action: PayloadAction<{events: PlaybackEvent[]; lastMeasure: number}>
    ) => {
      state.playbackEvents.push(...action.payload.events);
      state.lastMeasure = action.payload.lastMeasure;
    },
  },
});

// Selectors
export const getCurrentlyPlayingBlockIds = (state: {
  music: MusicState;
}): string[] => {
  const {currentPlayheadPosition, playbackEvents} = state.music;
  const playingBlockIds: string[] = [];

  playbackEvents.forEach((playbackEvent: PlaybackEvent) => {
    const currentlyPlaying =
      currentPlayheadPosition !== 0 &&
      currentPlayheadPosition >= playbackEvent.when &&
      currentPlayheadPosition < playbackEvent.when + playbackEvent.length;

    if (currentlyPlaying) {
      playingBlockIds.push(playbackEvent.blockId);
    }
  });

  return playingBlockIds;
};

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
  toggleBeatPad,
  setCurrentProgressState,
  clearPlaybackEvents,
  addPlaybackEvents,
} = musicSlice.actions;
