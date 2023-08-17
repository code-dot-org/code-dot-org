import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {MIN_NUM_MEASURES} from '../constants';
import {PlaybackEvent} from '../player/interfaces/PlaybackEvent';
import {FunctionEvents} from '../player/interfaces/FunctionEvents';

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

export interface MusicState {
  /** If the song is currently playing */
  isPlaying: boolean;
  /** The current 1-based playhead position, scaled to measures */
  currentPlayheadPosition: number;
  /** The ID of the currently selected block, or undefined if no block is selected */
  selectedBlockId: string | undefined;
  /** If the timeline should be positioned at the top above the workspace */
  timelineAtTop: boolean;
  /** If instructions should be shown */
  showInstructions: boolean;
  /** Where instructions should be placed (left, top, or right) */
  instructionsPosition: InstructionsPosition;
  /** If the headers should be hidden */
  hideHeaders: boolean;
  /** If the Control Pad (Beat Pad) is showing */
  isBeatPadShowing: boolean;
  /** The current list of playback events */
  playbackEvents: PlaybackEvent[];
  /** The current ordered functions */
  orderedFunctions: FunctionEvents[];
  /** The current last measure of the song */
  lastMeasure: number;
  /** The current sound loading progress, from 0-1 inclusive, representing the
   * number of sounds loaded out of the total number of sounds to load.
   */
  soundLoadingProgress: number;
  /** The 1-based playhead position to start playback from, scaled to measures */
  startingPlayheadPosition: number;
  undoStatus: {
    canUndo: boolean;
    canRedo: boolean;
  };
}

const initialState: MusicState = {
  isPlaying: false,
  currentPlayheadPosition: 0,
  selectedBlockId: undefined,
  timelineAtTop: false,
  showInstructions: false,
  instructionsPosition: InstructionsPosition.LEFT,
  hideHeaders: false,
  isBeatPadShowing: true,
  playbackEvents: [],
  orderedFunctions: [],
  lastMeasure: 0,
  soundLoadingProgress: 0,
  startingPlayheadPosition: 1,
  undoStatus: {
    canUndo: false,
    canRedo: false,
  },
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
    showHeaders: state => {
      state.hideHeaders = false;
    },
    hideHeaders: state => {
      state.hideHeaders = true;
    },
    toggleHeaders: state => {
      state.hideHeaders = !state.hideHeaders;
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
    clearPlaybackEvents: state => {
      state.playbackEvents = [];
      state.lastMeasure = 0;
    },
    clearOrderedFunctions: state => {
      state.orderedFunctions = [];
    },
    addPlaybackEvents: (
      state,
      action: PayloadAction<{events: PlaybackEvent[]; lastMeasure: number}>
    ) => {
      state.playbackEvents.push(...action.payload.events);
      state.lastMeasure = action.payload.lastMeasure;
    },
    addOrderedFunctions: (
      state,
      action: PayloadAction<{orderedFunctions: FunctionEvents[]}>
    ) => {
      state.orderedFunctions.push(...action.payload.orderedFunctions);
    },
    setSoundLoadingProgress: (state, action: PayloadAction<number>) => {
      state.soundLoadingProgress = action.payload;
    },
    setStartPlayheadPosition: (state, action: PayloadAction<number>) => {
      state.startingPlayheadPosition = action.payload;
    },
    moveStartPlayheadPositionForward: state => {
      state.startingPlayheadPosition = Math.min(
        state.startingPlayheadPosition + 1,
        Math.max(state.lastMeasure, MIN_NUM_MEASURES)
      );
    },
    moveStartPlayheadPositionBackward: state => {
      state.startingPlayheadPosition = Math.max(
        1,
        state.startingPlayheadPosition - 1
      );
    },
    setUndoStatus: (
      state,
      action: PayloadAction<{canUndo: boolean; canRedo: boolean}>
    ) => {
      state.undoStatus = action.payload;
    },
  },
});

// Selectors
export const getCurrentlyPlayingBlockIds = (state: {
  music: MusicState;
}): string[] => {
  const {isPlaying, currentPlayheadPosition, playbackEvents} = state.music;
  if (!isPlaying) {
    return [];
  }
  const playingBlockIds: string[] = [];

  playbackEvents.forEach((playbackEvent: PlaybackEvent) => {
    const currentlyPlaying =
      currentPlayheadPosition !== 0 &&
      currentPlayheadPosition >= playbackEvent.when &&
      currentPlayheadPosition < playbackEvent.when + playbackEvent.length &&
      !(
        playbackEvent.skipContext?.insideRandom &&
        playbackEvent.skipContext?.skipSound
      );

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
  showHeaders,
  hideHeaders,
  toggleHeaders,
  showBeatPad,
  hideBeatPad,
  toggleBeatPad,
  clearPlaybackEvents,
  clearOrderedFunctions,
  addPlaybackEvents,
  addOrderedFunctions,
  setSoundLoadingProgress,
  setStartPlayheadPosition,
  moveStartPlayheadPositionForward,
  moveStartPlayheadPositionBackward,
  setUndoStatus,
} = musicSlice.actions;
