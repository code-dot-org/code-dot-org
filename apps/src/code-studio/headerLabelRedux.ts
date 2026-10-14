// A label the level header shows beside the unit name when the page knows
// better than the lesson's levels: an adaptive pathway names the checkpoint
// a student is in. Null leaves the header to the levels.

import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface HeaderLabelState {
  label: string | null;
}

const initialState: HeaderLabelState = {label: null};

const headerLabelSlice = createSlice({
  name: 'headerLabel',
  initialState,
  reducers: {
    setHeaderLabel(state, action: PayloadAction<string | null>) {
      state.label = action.payload;
    },
  },
});

export const {setHeaderLabel} = headerLabelSlice.actions;
export default headerLabelSlice.reducer;
