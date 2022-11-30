import {createSlice} from '@reduxjs/toolkit';
import {registerReducers} from '@cdo/apps/redux';

export const InstructionsPositions = {
  TOP: 'TOP',
  LEFT: 'LEFT',
  RIGHT: 'RIGHT'
};

const instructionPositionOrder = [
  InstructionsPositions.TOP,
  InstructionsPositions.LEFT,
  InstructionsPositions.RIGHT
];

const initialState = {
  isPlaying: false,
  timelineAtTop: false,
  showInstructions: true,
  showBeatPad: false,
  instructionsPosition: InstructionsPositions.LEFT,
  currentAudioElapsedTime: 0,
  soundEvents: []
};

const musicSlice = createSlice({
  name: 'music',
  initialState,
  reducers: {
    setIsPlaying: (state, action) => {
      state.isPlaying = action.payload;
    },
    toggleInstructions: state => {
      state.showInstructions = !state.showInstructions;
    },
    toggleTimelinePosition: state => {
      state.timelineAtTop = !state.timelineAtTop;
    },
    shiftInstructionsPosition: state => {
      state.instructionsPosition =
        instructionPositionOrder[
          (instructionPositionOrder.indexOf(state.instructionsPosition) + 1) %
            instructionPositionOrder.length
        ];
    },
    setBeatPadShowing: (state, action) => {
      state.showBeatPad = action.payload;
    },
    toggleBeatPad: state => {
      state.showBeatPad = !state.showBeatPad;
    },
    setCurrentAudioElapsedTime: (state, action) => {
      state.currentAudioElapsedTime = action.payload;
    },
    setSoundEvents: (state, action) => {
      // Re-map sound events to strip unneeded data and avoid issues with invariance
      state.soundEvents = action.payload.map(event => ({
        id: event.id,
        when: event.when
      }));
    }
  }
});

export const {
  setIsPlaying,
  toggleInstructions,
  toggleTimelinePosition,
  shiftInstructionsPosition,
  setBeatPadShowing,
  toggleBeatPad,
  setCurrentAudioElapsedTime,
  setSoundEvents
} = musicSlice.actions;

registerReducers({music: musicSlice.reducer});
