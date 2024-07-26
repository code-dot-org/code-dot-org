import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import {
  DEFAULT_BPM,
  DEFAULT_KEY,
  MAX_BPM,
  MIN_BPM,
  MIN_NUM_MEASURES,
} from '../constants';
import {FunctionEvents} from '../player/interfaces/FunctionEvents';
import {PlaybackEvent} from '../player/interfaces/PlaybackEvent';
import {Key} from '../utils/Notes';

const registerReducers = require('@cdo/apps/redux').registerReducers;

/**
 * State, reducer, and actions for Music Lab.
 */

export enum InstructionsPosition {
  TOP = 'TOP',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

export interface MusicState {
  /** Current music library name */
  libraryName: string | null;
  /** Current pack ID, if a specific restricted pack from the current music library is selected */
  packId: string | null;
  /** If the song is currently playing */
  isPlaying: boolean;
  /** The current 1-based playhead position, scaled to measures */
  currentPlayheadPosition: number;
  /** The ID of the currently selected block, or undefined if no block is selected */
  selectedBlockId: string | undefined;
  /** The trigger ID of the currently selected trigger block, or undefined if no trigger block is selected */
  selectedTriggerId: string | undefined;
  /** If the timeline should be positioned at the top above the workspace */
  timelineAtTop: boolean;
  /** If instructions should be shown */
  showInstructions: boolean;
  /** Where instructions should be placed (left, top, or right) */
  instructionsPosition: InstructionsPosition;
  /** If the headers should be hidden */
  hideHeaders: boolean;
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
  /** A callout that's currently being shown.  The index lets the same callout be
   * reshown multiple times in a row.
   */
  currentCallout: {
    id?: string;
    index: number;
  };

  // State used by advanced controls (currently internal-only) with the ToneJS player
  loopEnabled: boolean;
  loopStart: number;
  loopEnd: number;
  key: Key;
  bpm: number;
}

const initialState: MusicState = {
  libraryName: null,
  packId: null,
  isPlaying: false,
  currentPlayheadPosition: 0,
  selectedBlockId: undefined,
  selectedTriggerId: undefined,
  timelineAtTop: false,
  showInstructions: false,
  instructionsPosition: InstructionsPosition.LEFT,
  hideHeaders: false,
  playbackEvents: [],
  orderedFunctions: [],
  lastMeasure: 0,
  // Default to 1 (fully loaded). When loading a new sound, the progress will be set back to 0 before the load starts.
  // This is to prevent the progress bar from showing if there are no sounds to load initially.
  soundLoadingProgress: 1,
  startingPlayheadPosition: 1,
  undoStatus: {
    canUndo: false,
    canRedo: false,
  },
  currentCallout: {
    id: undefined,
    index: 0,
  },
  loopEnabled: false,
  loopStart: 1,
  loopEnd: 5,
  key: DEFAULT_KEY,
  bpm: DEFAULT_BPM,
};

const musicSlice = createSlice({
  name: 'music',
  initialState,
  reducers: {
    setLibraryName: (state, action: PayloadAction<string>) => {
      state.libraryName = action.payload;
    },
    setPackId: (state, action: PayloadAction<string>) => {
      state.packId = action.payload;
    },
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
    setSelectedTriggerId: (state, action: PayloadAction<string>) => {
      if (state.isPlaying) {
        return;
      }
      state.selectedTriggerId = action.payload;
    },
    clearSelectedTriggerId: state => {
      state.selectedTriggerId = undefined;
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
    showCallout: (state, action: PayloadAction<string>) => {
      state.currentCallout.id = action.payload;
      state.currentCallout.index = state.currentCallout.index + 1;
    },
    clearCallout: state => {
      state.currentCallout.id = undefined;
    },
    setLoopEnabled: (state, action: PayloadAction<boolean>) => {
      state.loopEnabled = action.payload;
    },
    setLoopStart: (state, action: PayloadAction<number>) => {
      state.loopStart = action.payload;
    },
    setLoopEnd: (state, action: PayloadAction<number>) => {
      state.loopEnd = action.payload;
    },
    setKey: (state, action: PayloadAction<Key>) => {
      let key = action.payload;
      if (Key[key] === undefined) {
        console.warn('Invalid key. Defaulting to C');
        key = Key.C;
      }

      state.key = key;
    },
    setBpm: (state, action: PayloadAction<number>) => {
      let bpm = action.payload;
      if (bpm < MIN_BPM || bpm > MAX_BPM) {
        console.warn('Invalid BPM. Defaulting to 120');
        bpm = DEFAULT_BPM;
      }

      state.bpm = bpm;
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
  setLibraryName,
  setPackId,
  setIsPlaying,
  setCurrentPlayheadPosition,
  selectBlockId,
  setSelectedTriggerId,
  clearSelectedTriggerId,
  clearSelectedBlockId,
  toggleTimelinePosition,
  setShowInstructions,
  setInstructionsPosition,
  toggleInstructions,
  advanceInstructionsPosition,
  showHeaders,
  hideHeaders,
  toggleHeaders,
  clearPlaybackEvents,
  clearOrderedFunctions,
  addPlaybackEvents,
  addOrderedFunctions,
  setSoundLoadingProgress,
  setStartPlayheadPosition,
  moveStartPlayheadPositionForward,
  moveStartPlayheadPositionBackward,
  setUndoStatus,
  showCallout,
  clearCallout,
  setLoopEnabled,
  setLoopStart,
  setLoopEnd,
  setKey,
  setBpm,
} = musicSlice.actions;
