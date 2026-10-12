// What the level header's simple progress shows when something other than
// the lesson's levels drives it: an adaptive pathway reports the step a
// student is on within a checkpoint. Null leaves the header to the levels.

import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface SimpleProgressState {
  label: string;
  /** 1-based; a position of 0 is an empty bar. */
  position: number;
  total: number;
  /** Read by assistive technology in place of "Level n of m". */
  valueText?: string;
  /** Replaces the unit's image while set. */
  image?: string;
}

interface SliceState {
  progress: SimpleProgressState | null;
}

const initialState: SliceState = {progress: null};

const simpleProgressSlice = createSlice({
  name: 'simpleProgress',
  initialState,
  reducers: {
    setSimpleProgress(
      state,
      action: PayloadAction<SimpleProgressState | null>
    ) {
      state.progress = action.payload;
    },
  },
});

export const {setSimpleProgress} = simpleProgressSlice.actions;
export default simpleProgressSlice.reducer;
